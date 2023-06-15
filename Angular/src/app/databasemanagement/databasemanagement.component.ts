import {Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-databasemanagement',
  templateUrl: './databasemanagement.component.html',
  styleUrls: ['./databasemanagement.component.css']
})
export class DatabasemanagementComponent implements OnInit {


  selectedIndex: string | number;
  ngOnInit() {
    let index = localStorage.getItem('userTabLocation') || 0; // get stored number or zero if there is nothing stored
    this.selectedIndex = index; // with tabGroup being the MatTabGroup accessed through ViewChild
}

  handleMatTabChange(event: number) {
    localStorage.setItem('userTabLocation', event.toString());
}

}
