import { Injectable } from '@angular/core';
import { INote } from '../model/notes.model';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  notes!: INote[];
  id: number = 0;
  item!: INote;
  constructor() {}

  getData() {
    const notes = localStorage.getItem('notes');
    if (notes) {
      this.notes = JSON.parse(notes);
      return this.notes;
    } else return [];
  }
  getId() {
    const id = localStorage.getItem('id');
    if (id) {
      this.id = JSON.parse(id);
      return this.id;
    } else return 0;
  }
  createItem(title: string, body: string, tags: string[]) {
    this.getId();
    this.item = {
      id: ++this.id,
      title: title,
      body: body,
      tags: tags,
    };
    localStorage.setItem('id', JSON.stringify(this.id));
    return this.item;
  }
  addItem(item: INote) {
    this.notes.push(item);
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
  deleteItem(id: number) {
    const confirm = window.confirm('Are you really want to delete this note?');
    if (confirm) {
      this.notes = this.notes.filter((note: { id: number }) => note.id !== id);
      localStorage.setItem('notes', JSON.stringify(this.notes));
    }
  }
  updateItem(id: number, item: INote) {
    this.notes = this.notes.map((note) => (note.id == id ? item : note));
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
}
