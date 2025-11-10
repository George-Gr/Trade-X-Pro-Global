-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  sent_email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_alerts table
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  condition TEXT NOT NULL, -- 'above' or 'below'
  triggered BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  toast_enabled BOOLEAN NOT NULL DEFAULT true,
  order_notifications BOOLEAN NOT NULL DEFAULT true,
  margin_notifications BOOLEAN NOT NULL DEFAULT true,
  pnl_notifications BOOLEAN NOT NULL DEFAULT true,
  kyc_notifications BOOLEAN NOT NULL DEFAULT true,
  price_alert_notifications BOOLEAN NOT NULL DEFAULT true,
  risk_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Notifications created via edge functions only"
  ON public.notifications FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Price alerts policies
CREATE POLICY "Users can view own price alerts"
  ON public.price_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own price alerts"
  ON public.price_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price alerts"
  ON public.price_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own price alerts"
  ON public.price_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Notification preferences created via trigger only"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (false);

-- Create trigger to create default notification preferences
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_notification_preferences
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_triggered ON public.price_alerts(triggered) WHERE triggered = false;