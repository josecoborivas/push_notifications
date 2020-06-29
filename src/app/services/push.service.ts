import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';
import { async } from '@angular/core/testing';

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

  userId: string;

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

    this.oneSignal.handleNotificationOpened().subscribe( async (noti) => {
      // do something when a notification is opened
      console.log('notificacion abierta:', noti);
      await this.notificacionRecibida(noti.notification);
    });

    //Obtener userId
    this.oneSignal.getIds().then(info => {
      this.userId = info.userId;
      console.log(this.userId);
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
    await this.guardarNotificaciones();
  }

  guardarNotificaciones(){
    this.storage.set('notificaciones', this.mensajes);
  }

  async cargarNotificaciones(){
    //this.storage.clear();
    this.mensajes = await this.storage.get('notificaciones') || [];
  }

  async borrarMensajes(){
    await this.storage.clear();
    this.mensajes = [];
    this.cargarNotificaciones();
  }


}
