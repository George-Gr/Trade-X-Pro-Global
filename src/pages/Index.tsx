import React, { useEffect } from 'react';
import EnhancedHeader from '@/components/EnhancedHeader';
import EnhancedHero from '@/components/EnhancedHero';
import TrustBar from '@/components/TrustBar';
import FeaturesGrid from '@/components/FeaturesGrid';
import LiveMarketOverview from '@/components/LiveMarketOverview';
import PlatformDemo from '@/components/PlatformDemo';
import WhyChooseUs from '@/components/WhyChooseUs';
import EducationalResources from '@/components/EducationalResources';
import NewsFeed from '@/components/NewsFeed';
import Testimonials from '@/components/Testimonials';
import SecuritySection from '@/components/SecuritySection';
import EnhancedCTA from '@/components/EnhancedCTA';
import EnhancedFooter from '@/components/EnhancedFooter';

const Index: React.FC = () => {
  // Initialize intersection observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all elements with fade-in-up class
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Mega Menu */}
      <EnhancedHeader />

      {/* Enhanced Hero Section */}
      <EnhancedHero />

      {/* Trust Indicators Bar */}
      <TrustBar />

      {/* Expanded Features Grid */}
      <FeaturesGrid />

      {/* Live Market Overview */}
      <LiveMarketOverview />

      {/* Platform Demo Section */}
      <PlatformDemo />

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Educational Resources Preview */}
      <EducationalResources />

      {/* Real-time News Feed */}
      <NewsFeed />

      {/* Testimonials & Social Proof */}
      <Testimonials />

      {/* Security & Regulation Section */}
      <SecuritySection />

      {/* Enhanced CTA Section */}
      <EnhancedCTA />

      {/* Comprehensive Footer */}
      <EnhancedFooter />

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-40 opacity-0 translate-y-10"
        id="scrollToTop"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Initialize scroll-to-top button */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Show/hide scroll-to-top button based on scroll position
            window.addEventListener('scroll', function() {
              const scrollToTopBtn = document.getElementById('scrollToTop');
              if (scrollToTopBtn) {
                if (window.pageYOffset > 300) {
                  scrollToTopBtn.classList.remove('opacity-0', 'translate-y-10');
                  scrollToTopBtn.classList.add('opacity-100', 'translate-y-0');
                } else {
                  scrollToTopBtn.classList.add('opacity-0', 'translate-y-10');
                  scrollToTopBtn.classList.remove('opacity-100', 'translate-y-0');
                }
              }
            });
          `
        }}
      />
    </div>
  );
};

export default Index;
