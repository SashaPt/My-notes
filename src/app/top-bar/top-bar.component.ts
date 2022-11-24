import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
  @Output() onToggleForm = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
  showForm() {
    this.onToggleForm.emit();
  }
}
