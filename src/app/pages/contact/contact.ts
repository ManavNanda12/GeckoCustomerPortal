import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

  contactForm!: FormGroup;
  activeCard: number | null = null;
  isFormSubmitted = false;

  contactInfo = [
    {
      icon: 'location',
      title: 'Visit Us',
      content: '123 Business Street, Tech City, TC 12345',
      delay: '0s'
    },
    {
      icon: 'phone',
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      delay: '0.1s'
    },
    {
      icon: 'email',
      title: 'Email Us',
      content: 'hello@company.com',
      delay: '0.2s'
    },
    {
      icon: 'clock',
      title: 'Working Hours',
      content: 'Mon - Fri: 9AM - 6PM',
      delay: '0.3s'
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      this.isFormSubmitted = true;
      
      // Reset form after 3 seconds
      setTimeout(() => {
        this.contactForm.reset();
        this.isFormSubmitted = false;
      }, 3000);
    }
  }

  setActiveCard(index: number | null): void {
    this.activeCard = index;
  }
  
}
