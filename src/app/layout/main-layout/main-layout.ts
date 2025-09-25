import { Component } from '@angular/core';
import { Header } from "../../component/header/header";
import { Footer } from "../../component/footer/footer";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

}
