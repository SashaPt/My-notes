import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { INote } from './shared/model/notes.model';
import { NotesService } from './shared/service/notes.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('textarea', { read: ElementRef })
  textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('backdrop')
  backdrop!: ElementRef<HTMLDivElement>;
  notes: INote[] = [];
  filteredNotes: INote[] = [];
  note!: INote;
  tags: string[] = [];

  checkoutForm = this.formBuilder.group({
    title: '',
    message: '',
  });
  search = new FormControl<string>('');

  isFormShown: boolean = false;
  isAdded: boolean = false;
  isShown: boolean = false;
  isUpdated: boolean = false;

  constructor(
    private notesService: NotesService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getNotes();
  }
  createNewNote() {
    this.isAdded = true;
    this.isShown = false;
    this.isUpdated = false;
    this.checkoutForm.reset();
    this.toggleForm();
    this.tags = [];
  }
  toggleForm() {
    this.isFormShown = !this.isFormShown;
    this.getNotes();
  }
  onSubmit(): void {
    if (this.isAdded) {
      if (this.checkoutForm.value.title && this.checkoutForm.value.message) {
        const note = this.notesService.createItem(
          this.checkoutForm.value.title,
          this.checkoutForm.value.message,
          this.tags
        );
        this.notesService.addItem(note);
        this.toggleForm();
      }
      this.checkoutForm.reset();
    } else if (this.isShown) {
      this.toggleForm();
    } else if (this.isUpdated) {
      if (this.checkoutForm.value.title && this.checkoutForm.value.message) {
        const updated = this.notesService.createItem(
          this.checkoutForm.value.title,
          this.checkoutForm.value.message,
          this.tags
        );
        updated.id = this.note.id;
        this.notesService.updateItem(this.note.id, updated);
        this.getNotes();
        this.toggleForm();
      }
    }
  }

  getNotes() {
    this.notes = this.notesService.getData();
  }
  deleteNote(id: number) {
    this.notesService.deleteItem(id);
    this.getNotes();
  }
  readNote(item: INote) {
    this.isAdded = false;
    this.isShown = true;
    this.isUpdated = false;
    this.toggleForm();
    this.checkoutForm.controls['title'].setValue(item.title);
    this.checkoutForm.controls['message'].setValue(item.body);
    this.note = item;
  }
  updateNote(item: INote) {
    this.readNote(item);
    this.isShown = false;
    this.isUpdated = true;
    this.note = item;
  }

  createTag(text: string) {
    this.tags = [];
    let words = text.split(/ |\n|\,|\.|\:|\;|\!|\?/);
    words.forEach((word) => {
      if (
        word.startsWith('#') &&
        word.length > 1 &&
        !this.tags.includes(word.toLowerCase())
      ) {
        this.tags.push(word.toLowerCase());
      }
    });
    return this.tags;
  }

  filterNotes() {
    if (this.search.value) {
      return this.notes.filter((note) =>
        note.tags.find((tag) =>
          this.search.value
            ? tag.toLowerCase().includes(this.search.value.toLowerCase())
            : tag
        )
      );
    } else {
      return this.notes;
    }
  }

  deleteTag(tag: string, event: Event) {
    event.preventDefault();
    if (this.checkoutForm.value.message) {
      let text = this.checkoutForm.value.message;
      text = text.replace(new RegExp(`${tag}\\b`, 'gi'), tag.slice(1, tag.length));
      this.checkoutForm.controls['message'].setValue(text);
    }
  }

  highlightWords(item: INote) {
    if (this.checkoutForm.value.message) {
      let text = this.checkoutForm.value.message;
      item.tags.sort().reverse().forEach((tag) => {
        tag = tag.slice(1, tag.length);
        text = text.replace(new RegExp(`\\b${tag}\\b`, 'gi'), `<i>${tag}</i>`);
      });
      return text;
    } else return '';
  }
  handleScroll() {
    const scrollTop = this.textarea.nativeElement.scrollTop;
    this.backdrop.nativeElement.scrollTop = scrollTop;

    const scrollLeft = this.textarea.nativeElement.scrollLeft;
    this.backdrop.nativeElement.scrollLeft = scrollLeft;
  }
}
