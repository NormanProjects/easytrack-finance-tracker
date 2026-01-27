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
  intelligenceFeatures = [
    {
      title: 'Manual CSV Engine',
      description: 'Securely drag-and-drop your bank data. Our intelligent parser cleans merchant names and removes duplicates automatically.',
      icon: '📊'
    },
    {
      title: 'Safe to Spend',
      description: 'A visual intelligence engine that calculates exactly what you can spend today based on your remaining monthly budget.',
      icon: '⚡'
    },
    {
      title: 'Privacy First',
      description: 'Your financial data never leaves your control. No bank sync means no third-party access to your sensitive credentials.',
      icon: '🛡️'
    }
  ];

  faqs = [
    {
      question: 'How does the CSV upload work?',
      answer: 'Simply export your bank statements as CSV files and drag them into EasyTrack. Our intelligent parser automatically cleans up merchant names, categorizes transactions, and removes duplicates. Everything is processed locally on your device for maximum privacy.',
      isOpen: false
    },
    {
      question: 'Is my data stored securely?',
      answer: 'Yes. We use local processing - your data never leaves your device. All analysis happens locally with industry-standard encryption. No cloud storage of your financial information means no one else can access it.',
      isOpen: false
    },
    {
      question: 'Why no bank sync?',
      answer: 'Bank sync requires sharing your login credentials with third parties, creating security risks. By using manual CSV uploads, you maintain complete control over your data. It\'s more secure and gives you full transparency over what data is shared.',
      isOpen: false
    }
  ];

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}