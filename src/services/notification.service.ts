import { Injectable } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../common/ApiUrlHelper';
import { Common } from './common';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private messaging: Messaging, private readonly toastr: ToastrService, private api: ApiUrlHelper, private common: Common) { }

    // 🔑 Get permission + token
    async requestPermission() {
        try {
            const token = await getToken(this.messaging, {
                vapidKey: 'BEcrQ2OKZOMFfUG2qL9l9wCKDL9QYuB1LWTaSDV_VaJHOXs7mwe0Mnm5OENb611SXK3IkHv_Qd_6r9ppNfOkPKQ' // 🔥 from Firebase console
            });

            if (token && localStorage.getItem('CustomerId')) {
                console.log('✅ FCM Token:', token);
                let api = this.api.Customer.UpdateFCMToken;
                let requestedModel = {
                    CustomerId: localStorage.getItem('CustomerId'),
                    FCMToken: token
                }
                this.common.postData(api, requestedModel).pipe().subscribe({
                    next: (response) => {
                        if (response.success) {
                            console.log(response.message);
                        }
                        else {
                            console.warn('⚠️ Failed to update FCM token:', response.message);
                        }
                    }, error: (err: any) => {
                        console.error('❌ Error updating FCM token:', err);
                    }, complete: () => { }
                });

            } else {
                console.warn('❌ No token received');
            }
        } catch (error) {
            console.error('Permission denied', error);
        }
    }

    // 📩 Listen when app is OPEN (foreground)
    listen() {
        onMessage(this.messaging, (payload) => {
            this.toastr.info(payload.notification?.body, payload.notification?.title);
        });
    }
}