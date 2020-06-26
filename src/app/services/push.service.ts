import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[]=[
    // {
    //   title: 'Titulo de la push',
    //   body: 'Este es el body de la push',
    //   date: new Date()
    // }
  ];

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(
    private oneSignal: OneSignal,
    private storage: Storage
    ) { 
      this.cargarNotificaciones();
    }

  async getNotificaciones(){
    await this.cargarNotificaciones();
    return [...this.mensajes];
  }  

  configuracionInicial() {
    this.oneSignal.startInit('24823ed4-e4af-4dfc-a386-33d956ea9fe8', '298773103026');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
      // do something when notification is received
      console.log('notificacion recibida:', noti);
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe((noti) => {
      // do something when a notification is opened
      console.log('notificacion abierta:', noti);
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification){
    await this.cargarNotificaciones();
    const payload = noti.payload;
    const existePush = this.mensajes.find(mensaje => mensaje.notificationID === payload.notificationID);
    if(existePush) {
      return;
    }
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    this.guardarNotificaciones();
  }

  guardarNotificaciones(){
    this.storage.set('notificaciones', this.mensajes);
  }

  async cargarNotificaciones(){
    this.mensajes = await this.storage.get('notificaciones') || [];
  }


}
