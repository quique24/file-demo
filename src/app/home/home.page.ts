import { Component } from '@angular/core';
import { Plugins, CameraResultType, CameraSource, FilesystemDirectory, Capacitor } from '@capacitor/core';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { ImagePicker } from '@ionic-native/image-picker/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  images = [];

  constructor(
    private actionSheetController: ActionSheetController,
    private imagePicker: ImagePicker,
    public toastController: ToastController,
  ) { }


  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.pickImage();
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.takePhoto(CameraSource.Camera);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  async takePhoto(source) {
    const { Camera, Filesystem } = Plugins;

    const options = {
      quality: 20,
      resultType: CameraResultType.Uri,
      // resultType: CameraResultType.Base64,
      source: source
    };

    const originalPhoto = await Camera.getPhoto(options);
    this.convertImage(originalPhoto.path);

  }

  pickImage() {
    const options = {
      quality: 20,
    };
    this.imagePicker.getPictures(options).then((results) => {
      for (var i = 0; i < results.length; i++) {
        this.convertImage(results[i])
      }
    }, (err) => { });
  }

  async convertImage(imageUri) {
    const { Camera, Filesystem } = Plugins;

    /*  try {
        let ret = await Filesystem.mkdir({
          path: 'secrets',
          directory: FilesystemDirectory.Data,
          createIntermediateDirectories: true,
          recursive: true // like mkdir -p
        });
      } catch (e) {
        console.error('Unable to make directory', e);
      }*/

    const photoInTempStorage = await Filesystem.readFile({ path: imageUri });
    // const base64Img = this.domSanitizer.bypassSecurityTrustResourceUrl(originalPhoto && originalPhoto.base64Data,);

    const date = new Date(),
      time = date.getTime(),
      fileName = time + '.jpeg';

    await Filesystem.writeFile({
      data: photoInTempStorage.data,
      path: fileName,
      directory: FilesystemDirectory.Data
    });

    const finalPhotoUri = await Filesystem.getUri({
      directory: FilesystemDirectory.Data,
      path: fileName
    });

    const photoPath = Capacitor.convertFileSrc(finalPhotoUri.uri);
    // this.photo = this.domSanitizer.bypassSecurityTrustResourceUrl(photoPath);
    this.images.push(photoPath);
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 3000
    });
    toast.present();
  }

}
