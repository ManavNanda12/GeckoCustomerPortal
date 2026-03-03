import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Common } from '../../../services/common';
import { Products } from '../products/products';

@Component({
  selector: 'app-subscriptions',
  imports: [CommonModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
})
export class Subscriptions {
  currentActivePlanId: number = 1;
  planList: any = [];
  customerId: any = 0;

  constructor(
    private readonly router: Router,
    private readonly api: ApiUrlHelper,
    private readonly toastr: ToastrService,
    private readonly spinner: NgxSpinnerService,
    private readonly common: Common,
  ) {}

  ngOnInit(): void {
    this.customerId = localStorage.getItem('CustomerId') || 0;
    this.getCurrentUserPlan();
  }

  private getCurrentUserPlan(): void {
    let api = this.api.Plan.GetPlanList.replace(
      '{customerId}',
      this.customerId,
    );
    this.spinner.show();
    this.common
      .getData(api)
      .pipe()
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.planList = response.data;
            this.planList = response.data.map((plan: any) => ({
              ...plan,
              benefits: plan.benefits ? JSON.parse(plan.benefits) : [],
            }));
            const activePlan = this.planList.find((p: any) => p.isCurrentPlan);

            if (activePlan) {
              this.currentActivePlanId = activePlan.planId;
            } else {
              const freePlan = this.planList.find((p: any) =>
                p.planName.toLowerCase().includes('free'),
              );

              this.currentActivePlanId = freePlan?.planId ?? null;
            }
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          this.toastr.error(error.message);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  getCurrentPeriodText(plan: any): string | null {
    if (
      !this.isActive(plan) ||
      !plan.currentPeriodStart ||
      !plan.currentPeriodEnd
    ) {
      return null;
    }

    const start = new Date(plan.currentPeriodStart);
    const end = new Date(plan.currentPeriodEnd);

    const startStr = start.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const endStr = end.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    if (plan.cancelAtPeriodEnd) {
      return `Active until ${endStr} (cancels at period end)`;
    }

    return `Current period: ${startStr} - ${endStr}`;
  }

  isCancelledAtPeriodEnd(plan: any): boolean {
    return !!this.isActive(plan) && !!plan.cancelAtPeriodEnd;
  }

  selectPlan(plan: any): void {
    const checkModel = {
      customerId: this.customerId,
      planId: plan.planId,
    };

    this.spinner.show();

    this.common.postData(this.api.Plan.CheckPlan, checkModel).subscribe({
      next: (response) => {
        const action = response.data?.actionType;

        if (!action) {
          this.toastr.error('Unable to validate subscription.');
          return;
        }

        switch (action) {
          case 'BLOCK_ALREADY_ACTIVE':
            this.toastr.info('You already have this plan active.');
            break;

          case 'ALLOW_UPGRADE':
            if (
              confirm('Upgrade plan? You will be charged a prorated amount.')
            ) {
              this.callChangePlan(plan);
            }
            break;

          case 'ALLOW_DOWNGRADE':
            if (
              confirm(
                'Downgrade plan? Current benefits remain until billing period ends.',
              )
            ) {
              this.callChangePlan(plan);
            }
            break;

          case 'ALLOW_BUY':
            this.callChangePlan(plan);
            break;

          default:
            this.toastr.error('Invalid plan action.');
            break;
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  private callChangePlan(plan: any): void {
    if(this.customerId == 0 || this.customerId == null) {
      this.toastr.error('Please login to change your plan.');
      return;
    }
    const isFree = plan.planName.toLowerCase().includes('free');

    const requestedModel = {
      priceId: isFree ? '0' : plan.stripePriceId,
      customerId: this.customerId,
      planId: plan.planId,
      isFree: isFree,
      currentStripeSubscriptionId: plan.currentStripeSubscriptionId || null,
    };

    this.spinner.show();

    this.common
      .postData(this.api.Payment.ChangePlan, requestedModel)
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (response.data) {
              // Stripe Checkout redirect
              window.location.href = response.data;
            } else {
              // Upgrade or Downgrade handled without checkout
              this.toastr.success(response.message);
              this.getCurrentUserPlan();
            }
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          this.toastr.error(error.message);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  isActive(plan: any): boolean {
    return plan.planId === this.currentActivePlanId;
  }
}
