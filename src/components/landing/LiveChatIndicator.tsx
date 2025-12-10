import * as React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiveChatIndicator() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-gold shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-card border border-border rounded-lg shadow-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-accent rounded-full border-2 border-card"></div>
            </div>
            <div>
              <h4 className="font-semibold">Support Team</h4>
              <p className="text-sm text-accent">Online now</p>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4">
            Hi there! 👋 Have questions about TradeX Pro? We're here to help!
          </p>
          
          <div className="space-y-2">
            <a 
              href="mailto:support@tradexpro.com" 
              className="block w-full"
            >
              <Button className="w-full bg-primary hover:bg-primary/90">
                Email Support
              </Button>
            </a>
            <a 
              href="/company/contact" 
              className="block w-full"
            >
              <Button variant="outline" className="w-full">
                Contact Form
              </Button>
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Typical response time: &lt;2 hours
          </p>
        </div>
      )}
    </div>
  );
}
