import { Component, OnInit } from '@angular/core';
import { Howl, Howler } from 'howler';
import * as jsZip from 'jszip';
import * as localforage from 'localforage';
import { authorize, getToken } from '../authorization';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        console.log(params['code']);
        let code = params['code'];
        if (code)
          getToken(code, this.http);
      }
    );
  }

  async play() {
    //(await localforage.keys()).forEach(k => console.log(k))
    let ar:ArrayBuffer = await localforage.getItem('1-1000/thesaurus/1-1000-thesaurus-tough.mp3');
    let blob = new Blob( [ ar ], { type: 'music/mp3' } );
    let howlSource = URL.createObjectURL(blob)
    const sound = new Howl({
      src: [howlSource],
      preload: true,
      format: ['ogg'],
      onloaderror: (id, msg) => console.error(id, msg),
      onplayerror: (id, msg) => console.error(id, msg),
      onend: () => { console.log('played'); }
    });
    sound.play();
  }

  async downloader(data){
    jsZip.loadAsync(data).then((zip) => {
      const numberOfCallbacks = Object.keys(zip.files).length - 1;
      let counter = 0;
      let lstFiles = [];
      zip.forEach(function (relativePath, zipEntry) {
        zip.files[zipEntry.name].async('arraybuffer').then((data)=>{
          localforage.setItem(zipEntry.name,data);
          lstFiles.push(zipEntry.name);
          counter++;
          if (counter === numberOfCallbacks) {
            localforage.setItem("/1-1000.zip",lstFiles.filter(f => f.indexOf('.mp3')>0).join(','));
          }
        });
      });
    });
  }
  
  async download() {
    localforage.getItem('token').then(t => console.log(t));
    let url = "https://graph.microsoft.com/v1.0/me/drives/8d708a9b80ebb4b7/root/children/1-1000.zip/content";
    let token = await localforage.getItem('token');
    let self = this
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`);
    const requestOptions: Object = {
      headers: headers,
      responseType: 'blob'
    }
    this.http.get<ArrayBuffer>(url, requestOptions).subscribe((arrayBuffer:ArrayBuffer) => {
      var blob = new Blob([arrayBuffer], {type: "application/zip"});
      self.downloader(blob);
    });
  }

  authorize() {
    authorize();
  }

}
