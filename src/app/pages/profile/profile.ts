import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';

@Component({
  selector: 'app-profile',
  imports: [ MatTabsModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
    ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  activeTab = 'home';
  currentAnimation = '';
  profileForm!:FormGroup;
  isEditMode = false;
  private animations = [
    'fadeIn',
    'slideInRight',
    'bounceIn',
    'zoomIn',
    'flipIn',
    'slideInUp',
    'rotateIn',
    'expandIn'
  ];

  constructor(private readonly fb:FormBuilder , private readonly api:ApiUrlHelper){
    
  }

  ngOnInit(): void {
    this.initializeProfileForm();
  }

  changeTab(tab: string) {
    if (this.activeTab !== tab) {
      // Pick a random animation
      const randomIndex = Math.floor(Math.random() * this.animations.length);
      this.currentAnimation = this.animations[randomIndex];
      this.activeTab = tab;
    }
  }

  initializeProfileForm(){
    this.profileForm = this.fb.group({
      firstName: [{ value: 'John', disabled: true }, Validators.required],
      lastName: [{ value: 'Doe', disabled: true }, Validators.required],
      email: [{ value: 'john.doe@example.com', disabled: true }, [Validators.required, Validators.email]],
      contactNumber: [{ value: '+1234567890', disabled: true }, Validators.required]
    });
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode) {
      // Enable all fields except email
      this.profileForm.get('firstName')?.enable();
      this.profileForm.get('lastName')?.enable();
      this.profileForm.get('contactNumber')?.enable();
    } else {
      // Disable all fields
      this.profileForm.get('firstName')?.disable();
      this.profileForm.get('lastName')?.disable();
      this.profileForm.get('contactNumber')?.disable();
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Form submitted:', this.profileForm.getRawValue());
      // Handle form submission here
      this.toggleEdit(); // Switch back to view mode
    }
  }

  getCustomerDetails(){
    let api = this.api.Customer.GetCustomerDetails;
  }
}
