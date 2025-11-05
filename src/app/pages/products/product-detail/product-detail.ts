import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Common } from '../../../../services/common';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';

@Component({
  selector: 'app-product-detail',
  imports: [MatIconModule,MatDividerModule,CurrencyPipe,CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit{

  // Common Properties
  product: any;
  activeIndex = 0;
  imagePreviews: any[] = [];
  tiltX = 0;
  tiltY = 0;

  constructor(
    public dialogRef: MatDialogRef<ProductDetail>,
    private readonly api: ApiUrlHelper,
    private readonly commonService: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService
  ) {
    this.product = inject(MAT_DIALOG_DATA).product;
  }

  ngOnInit(): void {
    this.getProductImages();
  }

   getProductImages(){
    let api = this.api.Product.GetProductImage.replace("{Id}", this.product.productID.toString());
    this.spinner.show();
    this.commonService.getData(api).pipe().subscribe({
      next:(response)=>{
        if(response.data.length > 0){
           this.imagePreviews = response.data.map((image: any) => ({
            projectUrl: image.imageUrl,
            isPrimary: image.isPrimary ?? false,
            imageId: image.imageID
          }));
        }
      },
      error:(error)=>{
        this.toastr.error(error.error.message);
      },
      complete:()=>{
        this.spinner.hide();
      }
    })
  }

  selectImage(index: number) {
    this.activeIndex = index;
  }

  onCarouselSlide(event: any) {
    this.activeIndex = event.to;
  }

  onMouseMove(event: MouseEvent) {
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    this.tiltX = (event.clientY - centerY) / 40;
    this.tiltY = (centerX - event.clientX) / 40;
  }

  resetTilt() {
    this.tiltX = 0;
    this.tiltY = 0;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  @HostBinding('style.--tiltX') get cssTiltX() {
    return `${this.tiltX}deg`;
  }
  @HostBinding('style.--tiltY') get cssTiltY() {
    return `${this.tiltY}deg`;
  }


}
