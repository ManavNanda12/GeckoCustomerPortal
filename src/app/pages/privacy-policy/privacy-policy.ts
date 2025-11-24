import { Component } from '@angular/core';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { Common } from '../../../services/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.css'
})
export class PrivacyPolicy {

  //Common Properties
  privacyPolicy!:string;

  constructor(
    private readonly api:ApiUrlHelper,
    private readonly common:Common,
    private readonly spinner:NgxSpinnerService,
    private readonly toast:ToastrService
  ) { }

  ngOnInit(): void {
    this.getPrivacyPolicy();
  }

  getPrivacyPolicy(){
    this.spinner.show();
    this.common.getData(this.api.SitePolicy.GetPolicy).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.privacyPolicy = res.data[1].policyDescription;
      },
      error: (err) => {
        this.spinner.hide();
        this.toast.error(err.error.message);
      }
    })
  }

}
