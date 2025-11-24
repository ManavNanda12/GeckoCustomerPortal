import { Component } from '@angular/core';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { Common } from '../../../services/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [],
  templateUrl: './terms-and-conditions.html',
  styleUrl: './terms-and-conditions.css'
})
export class TermsAndConditions {

   //Common Properties
    termsAndConditions!:string;
  
    constructor(
      private readonly api:ApiUrlHelper,
      private readonly common:Common,
      private readonly spinner:NgxSpinnerService,
      private readonly toast:ToastrService
    ) { }
  
    ngOnInit(): void {
      this.getTermsAndConditions();
    }
  
    getTermsAndConditions(){
      this.spinner.show();
      this.common.getData(this.api.SitePolicy.GetPolicy).subscribe({
        next: (res) => {
          this.spinner.hide();
          this.termsAndConditions = res.data[0].policyDescription;
        },
        error: (err) => {
          this.spinner.hide();
          this.toast.error(err.error.message);
        }
      })
    }

}
