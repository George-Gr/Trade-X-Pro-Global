import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

const SIMULATED_SUBMIT_DELAY_MS = 1500;

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * ContactUs component - Displays a contact form for users to get in touch with support
 *
 * @component
 * @returns {JSX.Element} The rendered contact page with form and contact information
 */
export default function ContactUs() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) =>
        setTimeout(resolve, SIMULATED_SUBMIT_DELAY_MS)
      );

      // Form submission logic would go here
      // In production, this would send data to an API endpoint
      toast({
        title: 'Message Sent!',
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="pt-24 pb-20">
        <section className="bg-linear-to-br from-primary/10 to-primary-glow/5 py-16 mb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Contact Us
                <span className="block mt-2 bg-linear-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  We're Here to Help
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get in touch with our team for support, partnerships, or
                inquiries
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="text-center">
                <div className="h-14 w-14 rounded-lg bg-linear-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground mb-4">
                  support@tradexpro.com
                </p>
                <p className="text-sm text-muted-foreground">
                  Response time: 24 hours
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="text-center">
                <div className="h-14 w-14 rounded-lg bg-linear-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground mb-4">+1 (800) 123-4567</p>
                <p className="text-sm text-muted-foreground">
                  24/5 Support Available
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="text-center">
                <div className="h-14 w-14 rounded-lg bg-linear-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground mb-2">123 Finance Street</p>
                <p className="text-sm text-muted-foreground">
                  Trading District, TD 12345
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-8">Send us a Message</h2>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={() => (
                        <FormItem>
                          <FormLabel htmlFor="contact-name">Name</FormLabel>
                          <FormControl>
                            <Input
                              id="contact-name"
                              placeholder="Your name"
                              {...form.register('name', {
                                required: 'Name is required',
                                minLength: {
                                  value: 2,
                                  message: 'Name must be at least 2 characters',
                                },
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={() => (
                        <FormItem>
                          <FormLabel htmlFor="contact-email">Email</FormLabel>
                          <FormControl>
                            <Input
                              id="contact-email"
                              type="email"
                              placeholder="your@email.com"
                              {...form.register('email', {
                                required: 'Email is required',
                                pattern: {
                                  value:
                                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: 'Please enter a valid email address',
                                },
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      rules={{ required: 'Please select a subject' }}
                      render={({
                        field,
                      }: {
                        field: {
                          value: string;
                          onChange: (value: string) => void;
                        };
                      }) => (
                        <FormItem>
                          <FormLabel htmlFor="contact-subject">
                            Subject
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger id="contact-subject">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">
                                  General Inquiry
                                </SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                                <SelectItem value="partnership">
                                  Partnership
                                </SelectItem>
                                <SelectItem value="feedback">
                                  Feedback
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={() => (
                        <FormItem>
                          <FormLabel htmlFor="contact-message">
                            Message
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              id="contact-message"
                              placeholder="Your message..."
                              className="min-h-30"
                              {...form.register('message', {
                                required: 'Message is required',
                                minLength: {
                                  value: 10,
                                  message:
                                    'Message must be at least 10 characters',
                                },
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-linear-to-r from-primary to-primary-glow flex items-center justify-center gap-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="text-3xl font-bold mb-8">Departments</h2>
                <div className="space-y-6">
                  {[
                    {
                      dept: 'Support',
                      email: 'support@tradexpro.com',
                      hours: '24/5',
                    },
                    {
                      dept: 'Sales',
                      email: 'sales@tradexpro.com',
                      hours: 'Mon-Fri 09:00-18:00',
                    },
                    {
                      dept: 'Partnerships',
                      email: 'partners@tradexpro.com',
                      hours: 'Mon-Fri 09:00-18:00',
                    },
                    {
                      dept: 'Compliance',
                      email: 'compliance@tradexpro.com',
                      hours: 'Mon-Fri 09:00-18:00',
                    },
                    {
                      dept: 'Security',
                      email: 'security@tradexpro.com',
                      hours: '24/7',
                    },
                    {
                      dept: 'General',
                      email: 'hello@tradexpro.com',
                      hours: 'Mon-Fri 09:00-18:00',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <p className="font-semibold mb-2">{item.dept}</p>
                      <p className="text-sm text-primary mb-2">{item.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.hours}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-8">FAQ</h2>
              <div className="space-y-6">
                {[
                  {
                    q: 'What are your support hours?',
                    a: 'We provide support 24 hours a day, 5 days a week (Monday-Friday). Critical issues are handled outside these hours.',
                  },
                  {
                    q: 'How quickly will I get a response?',
                    a: 'We aim to respond to all inquiries within 24 hours during business hours and 48 hours during weekends.',
                  },
                  {
                    q: 'Do you offer phone support?',
                    a: 'Yes, phone support is available during business hours. Contact +1 (800) 123-4567.',
                  },
                  {
                    q: 'How can I report a security issue?',
                    a: 'Please email security@tradexpro.com immediately with details. All security reports are handled with priority.',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-6 bg-muted/50 rounded-lg border border-border"
                  >
                    <h3 className="font-bold mb-2">{item.q}</h3>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="bg-linear-to-br from-primary/10 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Create your account today and join our trading community
                </p>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-linear-to-r from-primary to-primary-glow"
                  >
                    Create Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
