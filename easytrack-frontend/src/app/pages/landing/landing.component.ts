
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  features = [
    {
      icon: '📊',
      title: 'Smart Insights',
      description: 'AI-powered insights that help you understand your spending patterns and find savings opportunities.'
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set and track financial goals with personalized projections and milestone celebrations.'
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Your data never leaves your device. Bank-level encryption with no account linking required.'
    },
    {
      icon: '📈',
      title: 'Wealth Building',
      description: 'Tools to help you invest smarter, pay off debt faster, and build wealth over time.'
    }
  ];

  intelligenceFeatures = [
    {
      title: 'Manual CSV Analysis',
      description: 'Upload your bank statements securely. We analyze them locally on your device - no cloud storage.',
      icon: '📤'
    },
    {
      title: 'Daily Spending Guidance',
      description: 'Get personalized daily spending limits that adjust based on your income, bills, and savings goals.',
      icon: '💡'
    },
    {
      title: 'Debt Freedom Forecast',
      description: 'See your exact debt-free date based on current payments. Get recommendations to pay off faster.',
      icon: '🗓️'
    }
  ];

  testimonials = [
    {
      text: "EasyTrack helped me pay off R15,000 in credit card debt. The daily spending limits were a game-changer.",
      author: "Sarah M.",
      role: "Teacher",
      avatar: "👩🏼‍🏫"
    },
    {
      text: "Finally a finance app that respects my privacy. No bank logins, just smart insights from my CSV files.",
      author: "David R.",
      role: "Software Engineer",
      avatar: "👨🏽‍💻"
    },
    {
      text: "The debt payoff calculator motivated me to stay on track. Seeing the end date made all the difference.",
      author: "Jessica L.",
      role: "Nurse",
      avatar: "👩🏾‍⚕️"
    }
  ];

  faqs = [
    {
      question: 'How is this different from other budgeting apps?',
      answer: 'EasyTrack focuses on privacy-first, manual control. Instead of connecting to your bank accounts, you upload CSVs. This gives you complete control over your data while still getting powerful insights.',
      isOpen: false
    },
    {
      question: 'Is my financial data safe?',
      answer: 'Yes. We use local processing - your data never leaves your device. All analysis happens locally with industry-standard encryption. No cloud storage of your financial information.',
      isOpen: false
    },
    {
      question: 'How do you calculate daily spending limits?',
      answer: 'Our algorithm considers your monthly income, subtracts bills and savings goals, then divides the remainder by days left in the month. It adjusts dynamically as you spend.',
      isOpen: false
    },
    {
      question: 'Can I track investments and retirement accounts?',
      answer: 'Yes. You can upload statements from investment accounts to track your portfolio performance and retirement progress alongside your regular budgeting.',
      isOpen: false
    },
    {
      question: 'What bank formats do you support?',
      answer: 'We support CSV exports from all major banks (FNB, Standard Bank, Capitec, etc.), as well as QFX, OFX, and QBO formats.',
      isOpen: false
    },
    {
      question: 'Is there a mobile app?',
      answer: 'Not yet, but our web app is fully responsive and works beautifully on mobile browsers. We\'re developing native iOS and Android apps for 2026.',
      isOpen: false
    }
  ];

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}