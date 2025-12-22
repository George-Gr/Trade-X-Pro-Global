-- Create comprehensive test suite for atomic execution integrity
-- This migration creates test functions and procedures to validate the stored procedures

-- ============================================
-- 1. TEST DATA GENERATION FUNCTIONS
-- ============================================

-- Function to create test user profile
CREATE OR REPLACE FUNCTION public.create_test_user_profile(
    p_user_id UUID,
    p_initial_balance DECIMAL DEFAULT 10000.00,
    p_initial_equity DECIMAL DEFAULT 10000.00,
    p_initial_margin_used DECIMAL DEFAULT 0.00
)
RETURNS jsonb AS $
DECLARE
    v_result jsonb;
    v_env TEXT;
BEGIN
    -- Only allow execution in test/development environments
    SELECT current_setting('app.environment', true) INTO v_env;
    IF v_env IS NULL OR v_env NOT IN ('test', 'development') THEN
        RAISE EXCEPTION 'Test functions can only be executed in test/development environments';
    END IF;

    -- Insert or update test user profile
    INSERT INTO public.profiles (
        id,
        balance,
        equity,
        margin_used,
        kyc_status,
        account_status,
        updated_at
    ) VALUES (
        p_user_id,
        p_initial_balance,
        p_initial_equity,
        p_initial_margin_used,
        'verified',
        'active',
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        balance = p_initial_balance,
        equity = p_initial_equity,
        margin_used = p_initial_margin_used,
        kyc_status = 'verified',
        account_status = 'active',
        updated_at = now();

    v_result := jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'initial_balance', p_initial_balance,
        'initial_equity', p_initial_equity,
        'initial_margin_used', p_initial_margin_used,
        'timestamp', now()
    );

    RETURN v_result;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create test asset specification
CREATE OR REPLACE FUNCTION public.create_test_asset_spec(
    p_symbol TEXT,
    p_asset_class TEXT DEFAULT 'stock',
    p_leverage INTEGER DEFAULT 1,
    p_is_tradable BOOLEAN DEFAULT true
)
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Insert or update test asset specification
    INSERT INTO public.asset_specs (
        symbol,
        asset_class,
        leverage,
        is_tradable,
        min_quantity,
        max_quantity,
        pip_size,
        base_commission,
        commission_type
    ) VALUES (
        p_symbol,
        p_asset_class,
        p_leverage,
        p_is_tradable,
        1.0,
        100000.0,
        0.01,
        0.02,
        'per_share'
    )
    ON CONFLICT (symbol) DO UPDATE SET
        asset_class = p_asset_class,
        leverage = p_leverage,
        is_tradable = p_is_tradable,
        updated_at = now();

    v_result := jsonb_build_object(
        'success', true,
        'symbol', p_symbol,
        'asset_class', p_asset_class,
        'leverage', p_leverage,
        'is_tradable', p_is_tradable,
        'timestamp', now()
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. ATOMIC EXECUTION TEST PROCEDURES
-- ============================================

-- Test procedure for successful order execution
CREATE OR REPLACE FUNCTION public.test_successful_order_execution()
RETURNS jsonb AS $$
DECLARE
    v_test_user_id UUID := gen_random_uuid();
    v_test_symbol TEXT := 'TEST_STOCK';
    v_result jsonb;
    v_initial_balance DECIMAL;
    v_final_balance DECIMAL;
    v_transaction_id UUID := gen_random_uuid();
BEGIN
    -- Setup test data
    PERFORM public.create_test_user_profile(v_test_user_id, 5000.00);
    PERFORM public.create_test_asset_spec(v_test_symbol);
    
    -- Get initial balance
    SELECT balance INTO v_initial_balance FROM public.profiles WHERE id = v_test_user_id;

    -- Test balance and margin update
    SELECT * INTO v_result FROM public.update_user_balance_and_margin(
        v_test_user_id,
        gen_random_uuid(), -- order_id
        'buy',
        100, -- quantity
        10.00, -- execution_price
        2.00, -- commission
        1002.00 -- total_cost
    );

    -- Wrap test operations in a block to ensure cleanup on both success and failure
    BEGIN
        -- Verify success
        IF (v_result ->> 'success')::BOOLEAN THEN
            -- Get final balance
            SELECT balance INTO v_final_balance FROM public.profiles WHERE id = v_test_user_id;
            
            v_result := jsonb_build_object(
                'test', 'successful_order_execution',
                'success', true,
                'initial_balance', v_initial_balance,
                'final_balance', v_final_balance,
                'balance_change', v_final_balance - v_initial_balance,
                'expected_change', -1002.00,
                'balance_correct', (v_final_balance - v_initial_balance) = -1002.00,
                'transaction_details', v_result,
                'timestamp', now()
            );
        ELSE
            v_result := jsonb_build_object(
                'test', 'successful_order_execution',
                'success', false,
                'error', 'Balance update failed',
                'transaction_details', v_result,
                'timestamp', now()
            );
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Cleanup on error
        DELETE FROM public.profiles WHERE id = v_test_user_id;
        -- Re-raise the error after cleanup
        RAISE;
    END;

    -- Cleanup on success
    DELETE FROM public.profiles WHERE id = v_test_user_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test procedure for rollback functionality
CREATE OR REPLACE FUNCTION public.test_order_rollback()
RETURNS jsonb AS $$
DECLARE
    v_test_user_id UUID := gen_random_uuid();
    v_order_id UUID := gen_random_uuid();
    v_result jsonb;
    v_initial_balance DECIMAL;
    v_final_balance DECIMAL;
BEGIN
    -- Setup test data
    PERFORM public.create_test_user_profile(v_test_user_id, 5000.00);
    PERFORM public.create_test_asset_spec('TEST_STOCK');
    
    -- Create a test order
    INSERT INTO public.orders (
        id,
        user_id,
        symbol,
        order_type,
        side,
        quantity,
        status,
        total_cost,
        execution_price,
        commission,
        idempotency_key
    ) VALUES (
        v_order_id,
        v_test_user_id,
        'TEST_STOCK',
        'market',
        'buy',
        100,
        'executing',
        1002.00,
        10.00,
        2.00,
        'test-rollback-' || v_order_id::TEXT
    );

    -- Get initial balance
    SELECT balance INTO v_initial_balance FROM public.profiles WHERE id = v_test_user_id;

    -- Test rollback
    SELECT * INTO v_result FROM public.rollback_order_execution(
        v_order_id,
        v_test_user_id,
        'Test rollback reason'
    );

    -- Verify rollback
    IF (v_result ->> 'success')::BOOLEAN THEN
        SELECT balance INTO v_final_balance FROM public.profiles WHERE id = v_test_user_id;
        
        v_result := jsonb_build_object(
            'test', 'order_rollback',
            'success', true,
            'initial_balance', v_initial_balance,
            'final_balance', v_final_balance,
            'balance_restored', (v_result ->> 'balance_restored')::DECIMAL,
            'rollback_successful', v_final_balance = v_initial_balance,
            'transaction_details', v_result,
            'timestamp', now()
        );
    ELSE
        v_result := jsonb_build_object(
            'test', 'order_rollback',
            'success', false,
            'error', 'Rollback failed',
            'transaction_details', v_result,
            'timestamp', now()
        );
    END IF;

    -- Cleanup
    DELETE FROM public.profiles WHERE id = v_test_user_id;
    DELETE FROM public.orders WHERE id = v_order_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test procedure for insufficient balance scenario
CREATE OR REPLACE FUNCTION public.test_insufficient_balance_scenario()
RETURNS jsonb AS $$
DECLARE
    v_test_user_id UUID := gen_random_uuid();
    v_result jsonb;
BEGIN
    -- Setup test data with insufficient balance
    PERFORM public.create_test_user_profile(v_test_user_id, 100.00); -- Only $100
    
    -- Test balance update that should fail
    SELECT * INTO v_result FROM public.update_user_balance_and_margin(
        v_test_user_id,
        gen_random_uuid(),
        'buy',
        1000, -- Large quantity
        10.00, -- High price
        2.00, -- commission
        10002.00 -- Total cost exceeds balance
    );

    -- Verify proper error handling
    IF (v_result ->> 'success')::BOOLEAN THEN
        v_result := jsonb_build_object(
            'test', 'insufficient_balance_scenario',
            'success', false,
            'error', 'Should have failed with insufficient balance',
            'unexpected_success', v_result,
            'timestamp', now()
        );
    ELSE
        v_result := jsonb_build_object(
            'test', 'insufficient_balance_scenario',
            'success', true,
            'expected_error', (v_result ->> 'error_code'),
            'error_handling_correct', (v_result ->> 'error_code') = 'INSUFFICIENT_BALANCE',
            'transaction_details', v_result,
            'timestamp', now()
        );
    END IF;

    -- Cleanup
    DELETE FROM public.profiles WHERE id = v_test_user_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test procedure for transaction integrity validation
CREATE OR REPLACE FUNCTION public.test_transaction_integrity_validation()
RETURNS jsonb AS $$
DECLARE
    v_test_user_id UUID := gen_random_uuid();
    v_transaction_id UUID := gen_random_uuid();
    v_result jsonb;
    v_order_id UUID;
    v_position_id UUID;
BEGIN
    -- Setup test data
    PERFORM public.create_test_user_profile(v_test_user_id, 5000.00);
    PERFORM public.create_test_asset_spec('TEST_STOCK');
    
    -- Create a test order with transaction_id
    INSERT INTO public.orders (
        id,
        user_id,
        symbol,
        order_type,
        side,
        quantity,
        status,
        transaction_id,
        idempotency_key
    ) VALUES (
        gen_random_uuid(),
        v_test_user_id,
        'TEST_STOCK',
        'market',
        'buy',
        100,
        'executed',
        v_transaction_id,
        'test-integrity-' || v_transaction_id::TEXT
    )
    RETURNING id INTO v_order_id;

    -- Create a test position with same transaction_id
    INSERT INTO public.positions (
        user_id,
        symbol,
        side,
        quantity,
        entry_price,
        current_price,
        margin_used,
        status,
        transaction_id
    ) VALUES (
        v_test_user_id,
        'TEST_STOCK',
        'buy',
        100,
        10.00,
        10.00,
        1000.00,
        'open',
        v_transaction_id
    )
    RETURNING id INTO v_position_id;

    -- Test integrity validation
    SELECT * INTO v_result FROM public.validate_atomic_execution_integrity(
        v_transaction_id,
        v_test_user_id
    );

    -- Verify integrity check
    IF (v_result ->> 'success')::BOOLEAN THEN
        v_result := jsonb_build_object(
            'test', 'transaction_integrity_validation',
            'success', true,
            'integrity_check_passed', (v_result ->> 'status') = 'valid',
            'order_count', (v_result ->> 'order_count')::INTEGER,
            'position_count', (v_result ->> 'position_count')::INTEGER,
            'order_position_match', (v_result ->> 'order_count')::INTEGER = (v_result ->> 'position_count')::INTEGER,
            'transaction_details', v_result,
            'timestamp', now()
        );
    ELSE
        v_result := jsonb_build_object(
            'test', 'transaction_integrity_validation',
            'success', false,
            'integrity_check_failed', v_result,
            'timestamp', now()
        );
    END IF;

    -- Cleanup
    DELETE FROM public.positions WHERE id = v_position_id;
    DELETE FROM public.orders WHERE id = v_order_id;
    DELETE FROM public.profiles WHERE id = v_test_user_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. COMPREHENSIVE TEST RUNNER
-- ============================================

-- Function to run all atomic execution tests
CREATE OR REPLACE FUNCTION public.run_atomic_execution_tests()
RETURNS jsonb AS $$
DECLARE
    v_results jsonb[] := ARRAY[]::jsonb[];
    v_success_count INTEGER := 0;
    v_total_count INTEGER := 0;
    v_overall_result jsonb;
BEGIN
    -- Run all test procedures
    SELECT public.test_successful_order_execution() INTO v_results[1];
    SELECT public.test_order_rollback() INTO v_results[2];
    SELECT public.test_insufficient_balance_scenario() INTO v_results[3];
    SELECT public.test_transaction_integrity_validation() INTO v_results[4];
    
    -- Count successes
    FOR i IN 1..4 LOOP
        v_total_count := v_total_count + 1;
        IF (v_results[i] ->> 'success')::BOOLEAN THEN
            v_success_count := v_success_count + 1;
        END IF;
    END LOOP;

    -- Build comprehensive result
    v_overall_result := jsonb_build_object(
        'test_suite', 'atomic_execution_integrity',
        'total_tests', v_total_count,
        'passed_tests', v_success_count,
        'failed_tests', v_total_count - v_success_count,
        'success_rate', ROUND((v_success_count::DECIMAL / v_total_count::DECIMAL) * 100, 2),
        'test_results', v_results,
        'overall_status', CASE 
            WHEN v_success_count = v_total_count THEN 'ALL_TESTS_PASSED'
            WHEN v_success_count > 0 THEN 'PARTIAL_SUCCESS'
            ELSE 'ALL_TESTS_FAILED'
        END,
        'timestamp', now()
    );

    RETURN v_overall_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users for testing
GRANT EXECUTE ON FUNCTION public.create_test_user_profile(UUID, DECIMAL, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_asset_spec(TEXT, TEXT, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_successful_order_execution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_order_rollback() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_insufficient_balance_scenario() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_transaction_integrity_validation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_atomic_execution_tests() TO authenticated;

-- Full permissions to service role
GRANT ALL ON FUNCTION public.create_test_user_profile(UUID, DECIMAL, DECIMAL, DECIMAL) TO service_role;
GRANT ALL ON FUNCTION public.create_test_asset_spec(TEXT, TEXT, INTEGER, BOOLEAN) TO service_role;
GRANT ALL ON FUNCTION public.test_successful_order_execution() TO service_role;
GRANT ALL ON FUNCTION public.test_order_rollback() TO service_role;
GRANT ALL ON FUNCTION public.test_insufficient_balance_scenario() TO service_role;
GRANT ALL ON FUNCTION public.test_transaction_integrity_validation() TO service_role;
GRANT ALL ON FUNCTION public.run_atomic_execution_tests() TO service_role;