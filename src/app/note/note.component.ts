import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { INote } from '../shared/model/notes.model';
import { NotesService } from '../shared/service/notes.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent implements OnInit {
  @Input() note!: INote;
  @Input() ind!: number;
  @Input() tags!: string[];
  @Output() delete = new EventEmitter<number>();
  @Output() update = new EventEmitter<number>();
  @Output() showForm = new EventEmitter();

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {}

  deleteNote(id: number) {
    this.delete.emit(id);
  }
  rewriteNote(id: number) {
    this.showForm.emit(id);
  }
}
