import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaSearch, FaQuestionCircle, FaBook } from "react-icons/fa";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Types
interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface SupportTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

// Sample data
const faqs: FaqItem[] = [
  {
    id: "1",
    question: "How do I reset my password?",
    answer:
      'You can reset your password by clicking on "Forgot Password" on the login page and following the instructions sent to your email.',
  },
  {
    id: "2",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for payment processing.",
  },
];

const supportTopics: SupportTopic[] = [
  {
    id: "1",
    title: "Getting Started Guide",
    description: "Learn how to set up your account and make the most of our platform.",
    icon: <FaBook className="text-blue-600 text-3xl" />,
    link: "/guides/getting-started",
  },
  {
    id: "2",
    title: "Video Tutorials",
    description: "Watch step-by-step tutorials for all our features.",
    icon: <FaQuestionCircle className="text-blue-600 text-3xl" />,
    link: "/tutorials",
  },
];

// Main Support Component
const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
        <p className="text-lg">Find answers to common questions, get in touch with our team, or explore helpful resources.</p>
      </header>

      <div className="mb-8">
        <div className="relative max-w-lg mx-auto">
          <Input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <Tabs defaultValue="faq" className="mb-8">
        <TabsList className="flex justify-center">
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible>
              {filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">No results found for "{searchQuery}"</p>
              <Button variant="link" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contact">
          <h2 className="text-2xl font-bold mb-6">Contact Our Support Team</h2>
          <form className="max-w-lg mx-auto space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input type="text" id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" name="email" required />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={5} required />
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <FaEnvelope className="text-blue-600 text-3xl mb-4" />
                <CardTitle>Email Us</CardTitle>
                <CardDescription>support@example.com</CardDescription>
              </CardHeader>
              <CardFooter>Typically responds within 24 hours</CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <FaPhone className="text-blue-600 text-3xl mb-4" />
                <CardTitle>Call Us</CardTitle>
                <CardDescription>+1 (555) 123-4567</CardDescription>
              </CardHeader>
              <CardFooter>Monday-Friday, 9am-5pm EST</CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <h2 className="text-2xl font-bold mb-6">Helpful Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportTopics.map((topic) => (
              <Card key={topic.id}>
                <CardHeader>
                  <div className="mb-4">{topic.icon}</div>
                  <CardTitle>{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <a href={topic.link} className="text-blue-600 hover:underline">
                    Learn more →
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;