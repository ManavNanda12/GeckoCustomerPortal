import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { Common } from '../../../services/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  //Common Properties
  protected currentYear: number = new Date().getFullYear();
  instagramLink!: string;
  facebookLink!: string;
  twitterLink!: string;
  youtubeLink!: string;

  constructor(
    private readonly api: ApiUrlHelper,
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getSocialUrls();
  }

  getSocialUrls() {
    this.spinner.show();
    this.common.getData(this.api.SitePolicy.GetPolicy).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.facebookLink = res?.data[2]?.policyDescription;
        this.twitterLink = res?.data[3]?.policyDescription;
        this.instagramLink = res?.data[4]?.policyDescription;
        this.youtubeLink = res?.data[5]?.policyDescription;
      },
      error: (err) => {
        this.spinner.hide();
        this.toast.error(err.error.message);
      },
    });
  }
}
