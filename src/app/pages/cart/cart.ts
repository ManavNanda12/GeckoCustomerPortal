import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Common } from '../../../services/common';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { CommonModule } from '@angular/common';
import { gymImages } from '../../../common/models/CommonInterfaces';
import { FormsModule } from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {
  // Common Properties
  cartItems: any[] = [];
  showCelebration: boolean = false;
  private animationFrame: any;
  customerId: number = 0;
  cartId: number = 0;
  outOfStockItems: any[] = [];
  couponCode: string = '';
  couponResponse: any;
  couponDiscount: number = 0;
  totalAmount: number = 0;
  discountedTotalAmount: any = 0;
  stripePromise = loadStripe(environment.stripePublishKey);
  stripe: any;
  elements: any;
  card: any;
  cardComplete: boolean = false;
  taxAmount: number = 0;
  showPriceBreakdown: boolean = false;
  taxPercentage: number = 0;

  // Payment Request (Google Pay / Apple Pay)
  paymentRequest: any;
  paymentRequestButton: any;
  canMakePayment: boolean = false;
  subscriptionDiscount: any = 0;
  isFreeShipping: boolean = false;
  currentPlanName: any;
  originalSubTotal: any = 0;

  constructor(
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private readonly api: ApiUrlHelper,
    private readonly ngZone: NgZone,
  ) { }

  async ngOnInit(): Promise<void> {
    this.customerId = Number(localStorage.getItem('CustomerId')) || 0;

    // First get cart details to have the correct amount
    await new Promise<void>((resolve) => {
      this.getCartDetails();
      // Wait for cart details to load
      const checkCart = setInterval(() => {
        if (this.discountedTotalAmount !== undefined) {
          clearInterval(checkCart);
          resolve();
        }
      }, 100);
    });

    // Then initialize Stripe with the correct amount
    await this.initializeStripe();
  }

  async initializeStripe(): Promise<void> {
    try {
      this.stripe = await this.stripePromise;

      if (!this.stripe) {
        console.error('Failed to load Stripe');
        this.toastr.error('Failed to load payment system');
        return;
      }

      this.elements = this.stripe.elements();

      // Initialize regular card element
      this.card = this.elements.create('card', {
        style: {
          base: {
            color: '#ffffff',
            iconColor: '#00ffff',
            fontFamily: 'Poppins, system-ui, sans-serif',
            fontSize: '16px',
            '::placeholder': {
              color: '#777777',
            },
          },
          invalid: {
            color: '#ff6b6b',
            iconColor: '#ff6b6b',
          },
        },
      });

      // Use ngZone to ensure Angular knows about the DOM changes
      this.ngZone.run(() => {
        // Wait for Angular to render the template
        setTimeout(() => {
          const cardElement = document.getElementById('card-element');
          if (cardElement) {
            try {
              this.card.mount('#card-element');
              this.card.on('change', (event: any) => {
                const displayError = document.getElementById('card-errors');
                if (displayError) {
                  displayError.textContent = event.error
                    ? event.error.message
                    : '';
                }
                this.cardComplete = event.complete;
              });
            } catch (error) {
              console.error('Error mounting card element:', error);
              this.toastr.error('Failed to load card input');
            }
          } else {
            console.error('card-element not found in DOM');
            // Retry after a longer delay for slow mobile devices
            setTimeout(() => {
              const retryElement = document.getElementById('card-element');
              if (retryElement) {
                this.card.mount('#card-element');
                this.card.on('change', (event: any) => {
                  const displayError = document.getElementById('card-errors');
                  if (displayError) {
                    displayError.textContent = event.error
                      ? event.error.message
                      : '';
                  }
                  this.cardComplete = event.complete;
                });
              }
            }, 500);
          }
        }, 300); // Increased timeout for mobile
      });

      // Initialize Payment Request Button
      await this.initializePaymentRequest();
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.toastr.error('Failed to load payment system');
    }
  }

  async initializePaymentRequest(): Promise<void> {
    if (!this.stripe) return;

    // Create payment request
    this.paymentRequest = this.stripe.paymentRequest({
      country: 'US', // Change to your country code
      currency: 'usd',
      total: {
        label: 'Total',
        amount: Math.round(this.discountedTotalAmount * 100), // Amount in cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if browser supports Google Pay or Apple Pay
    const canMakePaymentResult = await this.paymentRequest.canMakePayment();

    if (canMakePaymentResult) {
      this.canMakePayment = true;

      // Create Payment Request Button element
      this.paymentRequestButton = this.elements.create('paymentRequestButton', {
        paymentRequest: this.paymentRequest,
        style: {
          paymentRequestButton: {
            type: 'default', // 'default' | 'book' | 'buy' | 'donate'
            theme: 'dark', // 'dark' | 'light' | 'light-outline'
            height: '48px',
          },
        },
      });

      // Mount the Payment Request Button
      setTimeout(() => {
        const prButtonElement = document.getElementById(
          'payment-request-button',
        );
        if (prButtonElement) {
          this.paymentRequestButton.mount('#payment-request-button');
        }
      }, 200);

      // Handle payment method event
      this.paymentRequest.on('paymentmethod', async (event: any) => {
        this.spinner.show();

        try {
          // Create payment intent
          const apiUrl = this.api.Payment.CreatePaymentIntent;
          const requestedModel = {
            Amount: parseInt(this.discountedTotalAmount),
          };

          this.common.postData(apiUrl, requestedModel).subscribe({
            next: async (response) => {
              if (response.success) {
                const clientSecret = response.data;

                // Confirm the payment with the payment method from Google/Apple Pay
                const { error: confirmError, paymentIntent } =
                  await this.stripe.confirmCardPayment(
                    clientSecret,
                    { payment_method: event.paymentMethod.id },
                    { handleActions: false },
                  );

                if (confirmError) {
                  // Report to the browser that the payment failed
                  event.complete('fail');
                  this.toastr.error(confirmError.message || 'Payment failed');
                  this.spinner.hide();
                } else {
                  // Report to the browser that the payment was successful
                  event.complete('success');

                  if (paymentIntent.status === 'requires_action') {
                    // Let Stripe.js handle the next actions
                    const { error } =
                      await this.stripe.confirmCardPayment(clientSecret);
                    if (error) {
                      this.toastr.error(error.message || 'Payment failed');
                      this.spinner.hide();
                    } else {
                      // Payment succeeded
                      this.checkout(paymentIntent.status, paymentIntent.id);
                    }
                  } else {
                    // Payment succeeded
                    this.checkout(paymentIntent.status, paymentIntent.id);
                  }
                }
              } else {
                event.complete('fail');
                this.toastr.error('Please try again later');
                this.spinner.hide();
              }
            },
            error: (err: any) => {
              event.complete('fail');
              this.toastr.error('Payment initiation failed');
              this.spinner.hide();
            },
          });
        } catch (error) {
          event.complete('fail');
          console.error('Payment error:', error);
          this.toastr.error('Payment processing failed');
          this.spinner.hide();
        }
      });
    } else {
      this.canMakePayment = false;
    }
  }

  // Update payment request amount when cart changes
  updatePaymentRequestAmount(): void {
    if (this.paymentRequest && this.canMakePayment) {
      this.paymentRequest.update({
        total: {
          label: 'Total',
          amount: Math.round(this.discountedTotalAmount * 100),
        },
      });
    }
  }

  getCartDetails() {
    this.spinner.show();

    const requestedModel = {
      sessionId: this.common.getSessionId(),
      customerId: this.customerId,
    };

    this.common
      .postData(this.api.Cart.GetCartDetails, requestedModel)
      .subscribe({
        next: (res) => {
          const data = res?.data || [];

          if (!data.length) {
            this.cartItems = [];
            this.totalAmount = 0;
            this.discountedTotalAmount = 0;
            this.taxAmount = 0;
            this.couponDiscount = 0;
            this.subscriptionDiscount = 0;
            this.isFreeShipping = false;
            this.common.setCartProductCount(0);
            return;
          }

          this.cartItems = data;
          const cartSummary = data[0];

          this.cartId = cartSummary?.cartId;

          // 🔹 Mark out-of-stock items
          this.cartItems.forEach((item) => {
            const isOutOfStock =
              item.isQuantityAvailable === false ||
              item.stockStatus === 'INSUFFICIENT_STOCK' ||
              (item.maxAvailableQuantity !== undefined &&
                item.quantity > item.maxAvailableQuantity);

            item.outOfStock = isOutOfStock;

            item.availableQty = isOutOfStock
              ? item.maxAvailableQuantity ||
              item.availableQuantity ||
              item.stockQuantity ||
              0
              : null;
          });

          this.common.setCartProductCount(this.cartItems.length);

          // 🔹 Update cart customer ID if needed
          if (
            cartSummary?.cartId > 0 &&
            this.customerId > 0 &&
            this.cartItems.length > 0 &&
            cartSummary?.customerId == 0
          ) {
            this.updateCartCustomerId();
          }

          // =============================
          // 💰 Pricing Calculation Section
          // =============================

          this.totalAmount = cartSummary?.subTotal || 0;
          this.couponCode = cartSummary?.couponCode || null;
          this.couponDiscount = cartSummary?.discountAmount || 0;
          this.subscriptionDiscount = cartSummary?.subscriptionDiscount || 0;
          this.isFreeShipping = cartSummary?.isFreeShipping || false;
          this.currentPlanName = cartSummary?.currentPlanName || '';
          const originalSubTotal = cartSummary?.subTotal || 0;
          this.totalAmount = originalSubTotal; // keep for display

          // Store original for popup
          this.originalSubTotal = originalSubTotal;

          if (this.subscriptionDiscount > 0) {
            this.totalAmount =
              originalSubTotal -
              (originalSubTotal * this.subscriptionDiscount) / 100;
          }
          this.ngZone.run(() => {
            this.updatePaymentRequestAmount();
          });
          if (this.couponCode) {
            this.couponResponse = {
              success: true,
              message: 'Coupon already applied',
            };
          } else {
            this.couponResponse = null;
          }

          // Ensure discount does not exceed subtotal
          const safeDiscount = Math.min(this.couponDiscount, this.totalAmount);

          const taxableAmount = this.totalAmount - safeDiscount;
          const taxPct = cartSummary?.taxPercentage || 0;
          const taxRate = taxPct > 1 ? taxPct / 100 : taxPct;

          this.taxAmount = taxableAmount * taxRate;
          this.taxPercentage = taxPct;
          this.discountedTotalAmount = taxableAmount + this.taxAmount;

          // 🔹 Update Payment Request amount
          this.updatePaymentRequestAmount();
        },

        error: () => {
          this.toastr.error('Failed to fetch cart details');
        },

        complete: () => {
          this.spinner.hide();
        },
      });
  }

  increaseQuantity(item: any) {
    item.quantity++;
    item.itemTotal = item.quantity * item.price;
    this.updateCart(item);
  }

  decreaseQuantity(item: any) {
    item.quantity--;
    item.itemTotal = item.quantity * item.price;
    this.updateCart(item);
  }

  getCartTotal() {
    return this.cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  }

  handleImageError(item: any) {
    item.imageUrl = gymImages[Math.floor(Math.random() * gymImages.length)];
  }

  updateCart(item: any) {
    let updatedItem = {
      productId: item.productId,
      newQuantity: item.quantity,
      sessionId: this.common.getSessionId(),
      customerId: this.customerId,
    };
    this.common
      .postData(this.api.Cart.UpdateCartQuantity, updatedItem)
      .pipe()
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success(res.message);
            this.getCartDetails();
          } else {
            this.toastr.error(res.message);
          }
        },
        error: (err: any) => {
          this.toastr.error('Failed to update cart');
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  checkout(status: any, paymentIntentId: any) {
    if (this.customerId == 0 || this.customerId == null) {
      this.toastr.error('Please login to checkout');
      this.router.navigate(['/login']);
      return;
    }
    if (this.outOfStockItems.length > 0) {
      this.toastr.error('Some items are out of stock');
      return;
    }
    this.spinner.show();
    let requestedModel = {
      cartSessionId: this.common.getSessionId(),
      customerId: this.customerId,
      billingAddress: 'Jam',
      shippingAddress: 'Jam',
      paymentMethod: 'Card Payment',
      shippingSameAsBilling: true,
      orderNotes: '',
      stripePaymentStatus: status,
      paymentIntentId: paymentIntentId,
      subscriptionDiscountAmount:
        (this.originalSubTotal * this.subscriptionDiscount) / 100,
      currentPlanName: this.currentPlanName,
    };
    this.common
      .postData(this.api.Order.CheckOut, requestedModel)
      .pipe()
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showCelebration = true;
            this.triggerOrderAutomation(res.data.orderId);
            setTimeout(() => {
              this.ngZone.runOutsideAngular(() => {
                this.startFireworks();
              });
            }, 1000);

            setTimeout(() => {
              this.showCelebration = false;
              this.getCartDetails();
              cancelAnimationFrame(this.animationFrame);
              this.router.navigate(['/profile/orders']);
            }, 5000);
          } else {
            // Out of stock handling
            if (
              res.data &&
              res.data.outOfStockItems &&
              res.data.outOfStockItems.length > 0
            ) {
              this.outOfStockItems = res.data.outOfStockItems;
              // Mark cartItems with outOfStock flag
              this.cartItems.forEach((item) => {
                const out = this.outOfStockItems.find(
                  (o: any) => o.productId === item.productId,
                );
                if (out) {
                  item.outOfStock = true;
                  item.availableQty = out.availableQty;
                } else {
                  item.outOfStock = false;
                  item.availableQty = null;
                }
              });
            }
            this.toastr.error(res.message);
          }
        },
        error: (err: any) => {
          this.toastr.error('Failed to checkout');
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  startFireworks() {
    const canvas = document.getElementById(
      'fireworksCanvas',
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];

    const createFirework = (x: number, y: number) => {
      const colors = [
        '#ff7675',
        '#74b9ff',
        '#55efc4',
        '#ffeaa7',
        '#fd79a8',
        '#a29bfe',
      ];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x,
          y,
          angle: Math.random() * 2 * Math.PI,
          speed: Math.random() * 6 + 2,
          radius: 2,
          life: 80,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.speed *= 0.95;
        p.life--;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (p.life <= 0) particles.splice(i, 1);
      }

      this.animationFrame = requestAnimationFrame(render);
    };

    // launch fireworks every 600ms
    const interval = setInterval(() => {
      if (!this.showCelebration) {
        clearInterval(interval);
        return;
      }
      createFirework(
        Math.random() * canvas.width,
        Math.random() * canvas.height * 0.5,
      );
    }, 600);

    render();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrame);
  }

  updateCartCustomerId() {
    this.spinner.show();
    let requestedModel = {
      cartId: this.cartId,
      customerId: this.customerId,
    };
    this.common
      .postData(this.api.Cart.UpdateCartCustomerId, requestedModel)
      .pipe()
      .subscribe({
        next: (res) => {
          this.toastr.success('Cart updated successfully');
        },
        error: (err: any) => {
          this.toastr.error('Failed to update cart', 'Error');
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  getIsOutOfStock() {
    return this.cartItems.some(
      (item) =>
        item.isQuantityAvailable === false ||
        item.stockStatus === 'INSUFFICIENT_STOCK' ||
        (item.maxAvailableQuantity !== undefined &&
          item.quantity > item.maxAvailableQuantity),
    );
  }

  applyCoupon() {
    if (!this.couponCode) return;
    this.spinner.show();
    let requestedModel = {
      cartSessionId: this.common.getSessionId(),
      couponCode: this.couponCode,
    };
    let api = this.api.Coupon.ApplyCoupon;
    this.common
      .postData(api, requestedModel)
      .pipe()
      .subscribe({
        next: (res) => {
          this.couponResponse = res;
          if (res.success) {
            this.toastr.success(res.message);
            this.getCartDetails();
          }
        },
        error: (err: any) => {
          this.toastr.error('Failed to apply coupon', 'Error');
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  removeCoupon() {
    if (!this.couponCode) return;
    this.spinner.show();
    let requestedModel = {
      cartSessionId: this.common.getSessionId(),
    };
    let api = this.api.Coupon.RemoveCoupon.replace(
      '{CartSessionId}',
      this.common.getSessionId(),
    );
    this.common
      .postData(api, requestedModel)
      .pipe()
      .subscribe({
        next: (res) => {
          this.couponResponse = res;
          if (res.success) {
            this.toastr.success(res.message);
            this.couponCode = '';
            this.couponDiscount = 0;
            this.couponResponse = {
              success: null,
              message: 'Coupon already applied',
            };
            this.getCartDetails();
          }
        },
        error: (err: any) => {
          this.toastr.error('Failed to remove coupon', 'Error');
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  async createPayment() {
    if (this.customerId == 0 || this.customerId == null) {
      this.toastr.error('Please login to checkout');
      this.router.navigate(['/login']);
      return;
    }
    if (this.outOfStockItems.length > 0) {
      this.toastr.error('Some items are out of stock');
      return;
    }

    // Validate card details before proceeding
    if (!this.cardComplete) {
      this.toastr.error('Please add valid card details to checkout');
      return;
    }

    this.spinner.show();
    let apiUrl = this.api.Payment.CreatePaymentIntent;
    let requestedModel = {
      Amount: parseInt(this.discountedTotalAmount),
    };
    this.common
      .postData(apiUrl, requestedModel)
      .pipe()
      .subscribe({
        next: async (response) => {
          if (response.success) {
            const clientSecret = response.data;

            // Confirm card payment
            const result = await this.stripe.confirmCardPayment(clientSecret, {
              payment_method: {
                card: this.card,
                billing_details: {
                  name: this.customerId.toString(),
                },
              },
            });

            if (result.error) {
              this.toastr.error(result.error.message || 'Payment failed');
              this.spinner.hide();
            } else {
              // if (result.paymentIntent.status === 'succeeded') {
              //   // Call backend to verify + create order
              this.checkout(
                result.paymentIntent.status,
                result.paymentIntent.id,
              );
              // }
            }
          } else {
            this.toastr.error('Please try again later');
            this.spinner.hide();
          }
        },
        error: (err: any) => {
          this.toastr.error('Payment initiation failed');
          this.spinner.hide();
        },
      });
  }

  triggerOrderAutomation(orderId: number) {
  const orderApi = this.api.Order.GetOrderDetails.replace('{orderId}', orderId.toString());
 
  this.common.getData(orderApi).subscribe({
    next: (orderResponse) => {
      if (!orderResponse.success || !orderResponse.data?.length) return;
 
      const orderDetails = orderResponse.data;
      const order = orderDetails[0];
 
      const customerApi = this.api.Customer.GetCustomerDetails.replace(
        '{customerId}',
        this.customerId.toString()
      );
 
      this.common.getData(customerApi).subscribe({
        next: (customerResponse) => {
          if (!customerResponse.success) return;
 
          const customer = customerResponse.data;
 
          const itemRowsHtml = orderDetails.map((item: any) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
              <td style="padding:16px 14px 16px 0;vertical-align:middle;width:52px;">
                <img style="width:48px;height:48px;border-radius:10px;object-fit:cover;border:1px solid rgba(0,255,255,0.2);background:#1a1a1a;display:block;"
                     src="${item.imageUrl || ''}" alt="${item.productName}" />
              </td>
              <td style="padding:16px 0;vertical-align:middle;">
                <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:3px;">${item.productName}</div>
                <div style="font-size:12px;color:#666;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.productDescription || ''}</div>
              </td>
              <td style="padding:16px 0;vertical-align:middle;text-align:center;">
                <span style="display:inline-block;background:rgba(0,255,255,0.1);color:#00ffff;border:1px solid rgba(0,255,255,0.25);border-radius:6px;padding:3px 10px;font-size:13px;font-weight:600;">${item.quantity}</span>
              </td>
              <td style="padding:16px 0;vertical-align:middle;font-size:13px;color:#aaa;">&#8377;${item.unitPrice.toFixed(2)}</td>
              <td style="padding:16px 0;vertical-align:middle;font-size:14px;font-weight:700;color:#00bcd4;text-align:right;">&#8377;${item.lineTotal.toFixed(2)}</td>
            </tr>
          `).join('');
 
          const subscriptionDiscountRow = (order.subscriptionDiscount > 0) ? `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.04);">
              <span style="color:#888;">Subscription Discount
                <span style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700;margin-left:8px;letter-spacing:0.5px;vertical-align:middle;background:linear-gradient(90deg,#ffd700,#ffa500);color:#000;">${order.planName}</span>
              </span>
              <span style="color:#ffd700;font-weight:500;">-&#8377;${order.subscriptionDiscount.toFixed(2)}</span>
            </div>
          ` : '';
 
          const couponDiscountRow = (order.discountAmount > 0 && order.couponCode) ? `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.04);">
              <span style="color:#888;">Coupon Discount
                <span style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700;margin-left:8px;letter-spacing:0.5px;vertical-align:middle;background:linear-gradient(90deg,#e74c3c,#c0392b);color:#fff;">${order.couponCode}</span>
              </span>
              <span style="color:#4caf50;font-weight:500;">-&#8377;${order.discountAmount.toFixed(2)}</span>
            </div>
          ` : '';
 
          const totalSavingsAmount = (order.subscriptionDiscount || 0) + (order.discountAmount || 0);
 
          const savingsBanner = totalSavingsAmount > 0 ? `
            <div style="background:linear-gradient(135deg,rgba(76,175,80,0.12),rgba(139,195,74,0.08));border:1px solid rgba(76,175,80,0.3);border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px;margin-bottom:28px;">
              <div style="font-size:28px;">&#x1F437;</div>
              <div>
                <div style="font-size:12px;color:#81c784;text-transform:uppercase;letter-spacing:1px;">You saved on this order</div>
                <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#4caf50;">&#8377;${totalSavingsAmount.toFixed(2)}</div>
              </div>
            </div>
          ` : '';
 
          const makePayload = {
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerEmail: customer.email || '',
            orderId: order.id,
            orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric'
            }),
            orderStatus: this.getOrderStatusText(order.orderStatus),
            paymentStatus: this.getPaymentStatusText(order.paymentStatus),
            paymentMethod: order.paymentMethod || 'Card Payment',
            transactionId: order.transactionId || '',
            total: order.total.toFixed(2),
            taxAmount: order.taxAmount.toFixed(2),
            shippingAmount: order.shippingAmount.toFixed(2),
            discountAmount: order.discountAmount?.toFixed(2) || '0.00',
            subscriptionDiscount: order.subscriptionDiscount?.toFixed(2) || '0.00',
            couponCode: order.couponCode || '',
            planName: order.planName || '',
            grandTotal: (
              order.total +
              order.taxAmount +
              order.shippingAmount -
              (order.subscriptionDiscount || 0) -
              (order.discountAmount || 0)
            ).toFixed(2),
            totalSavings: totalSavingsAmount.toFixed(2),
            orderTrackingUrl: `${window.location.origin}/profile/orders`,
            itemRowsHtml: itemRowsHtml,
            subscriptionDiscountRow: subscriptionDiscountRow,
            couponDiscountRow: couponDiscountRow,
            savingsBanner: savingsBanner,
          };
 
          this.callMakeWebhook(makePayload);
        },
        error: (err) => {
          console.error('Failed to fetch customer details:', err);
        }
      });
    },
    error: (err) => {
      console.error('Failed to fetch order for automation:', err);
    }
  });
}
 
callMakeWebhook(payload: any) {
  const makeWebhookUrl = 'https://hook.eu1.make.com/5c7pwzn2xg5kbbnt5evj1fa1e2lf64d2';
 
  fetch(makeWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (res.ok) {
        console.log('✅ Make.com scenario triggered successfully');
      } else {
        console.warn('⚠️ Make.com webhook responded with:', res.status);
      }
    })
    .catch(err => {
      console.error('Make.com webhook failed:', err);
    });
}
 
getOrderStatusText(status: number): string {
  const textMap: any = {
    1: 'Pending',
    2: 'Processing',
    3: 'Shipped',
    4: 'Delivered',
    5: 'Cancelled'
  };
  return textMap[status] || 'Unknown';
}
 
getPaymentStatusText(paymentStatus: number | string): string {
  if (typeof paymentStatus === 'string') {
    return paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
  } else {
    const textMap: any = {
      0: 'Pending',
      1: 'Paid',
      2: 'Failed',
      3: 'Canceled'
    };
    return textMap[paymentStatus] || 'Pending';
  }
}


}
