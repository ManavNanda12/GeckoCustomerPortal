import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { Common } from '../../../services/common';

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
      content: 'gecko@company.com',
      delay: '0.2s'
    },
    {
      icon: 'clock',
      title: 'Working Hours',
      content: 'Mon - Fri: 9AM - 6PM',
      delay: '0.3s'
    }
  ];

  constructor(private fb: FormBuilder,
    private readonly api: ApiUrlHelper,
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService) {}

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
      this.spinner.show();
      let api = this.api.ContactUs.ContactUs;
      let requestedModel = {
        customerName: this.contactForm.value.name,
        customerEmail: this.contactForm.value.email,
        contactSubject: this.contactForm.value.subject,
        customerMessage: this.contactForm.value.message
      }
      this.common.postData(api,requestedModel).pipe().subscribe({
        next:(response)=>{
          if(response.success){
            this.toastr.success(response.message);
            this.contactForm.reset();
          }
        },
        error:(error)=>{
          console.log(error);
        },
        complete:()=>{
          this.spinner.hide();
        }
      })
    }
  }

  setActiveCard(index: number | null): void {
    this.activeCard = index;
  }
  
}
