import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { Common } from '../../../services/common';
import { CategoryResponse, gymImages } from '../../../common/models/CommonInterfaces';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category',
  imports: [CommonModule,MatIconModule],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class Category {

  // Common Properties
  allcategories:CategoryResponse[] = [];
  parentCategories: CategoryResponse[] = [];
  selectedCategory: CategoryResponse | null = null;
  childCategories: CategoryResponse[] = [];
  animateParentOut = false;
  animateChildIn = false;

  constructor(
    private readonly api: ApiUrlHelper,
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService
  ) {
    this.getCategoryList();
   }

  getCategoryList(){
    let api = this.api.Category.GetCategories;
    this.spinner.show();
    this.common.getData(api).pipe().subscribe({
      next: (res) => {
        this.spinner.hide();
        this.allcategories = res.data;
        this.parentCategories = this.allcategories.filter(c => c.parentCategoryID === null);
        setTimeout(() => {
          const parentSection = document.querySelector('.parent-section');
          if (parentSection) {
            parentSection.classList.add('animate-in');
            setTimeout(() => parentSection.classList.remove('animate-in'), 600);
          }
        }, 100);
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error("Failed to fetch categories", "Error");
      },
      complete: () => { this.spinner.hide(); }
    })
  }

  handleImageError(category: CategoryResponse) {
    category.imageUrl = gymImages[Math.floor(Math.random() * gymImages.length)];
  }

  showSubCategories(category: CategoryResponse) {
    if(this.allcategories.filter(c => c.parentCategoryID === category.categoryId).length > 0){
    this.animateParentOut = true;
    setTimeout(() => {
      this.selectedCategory = category;
      this.childCategories = this.allcategories.filter(c => c.parentCategoryID === category.categoryId);
      this.animateParentOut = false;
      this.animateChildIn = true;
    }, 600);
    }
  }

  closeChildCategories() {
    this.animateChildIn = false;
    setTimeout(() => {
      this.selectedCategory = null;
      this.childCategories = [];
      this.animateParentOut = false;
      setTimeout(() => {
        this.animateParentOut = false;
        const parentSection = document.querySelector('.parent-section');
        if (parentSection) {
          parentSection.classList.add('animate-in');
          setTimeout(() => parentSection.classList.remove('animate-in'), 600);
        }
      });
    }, 600);
  }
  

}
