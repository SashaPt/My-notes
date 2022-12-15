import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
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
  note!: INote;
  tags: string[] = [];

  checkoutForm = this.formBuilder.group({
    title: '',
    message: '',
  });
  searchSubject = new Subject<string | undefined>();
  searchSubscription?: Subscription;
  searchValue: string = '';

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
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchQuery) => this.notesService.searchItems(searchQuery))
      )
      .subscribe((data) => {
        this.notes = data;
      });
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
        this.notesService
          .searchItems(this.searchValue)
          .subscribe((data) => (this.notes = data));
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

  onSearch(event: Event) {
    const searchQuery = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchQuery?.trim());
    this.searchValue = searchQuery;
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

  deleteTag(tag: string, event: Event) {
    event.preventDefault();
    if (this.checkoutForm.value.message) {
      let text = this.checkoutForm.value.message;
      text = text.replace(
        new RegExp(text.match(`${tag}\\b`) ? `${tag}\\b` : `${tag}`, 'gi'),
        tag.slice(1, tag.length)
      );
      this.checkoutForm.controls['message'].setValue(text);
    }
  }

  highlightWords(item: INote) {
    if (this.checkoutForm.value.message) {
      let text = this.checkoutForm.value.message;
      const itemTags = item.tags.slice();
      itemTags
        .sort()
        .reverse()
        .forEach((tag) => {
          tag = tag.slice(1, tag.length);
          text = text.replace(
            new RegExp(
              text.match(`\\b${tag}\\b`) ? `\\b${tag}\\b` : `${tag}`,
              'gi'
            ),
            `<i>${tag}</i>`
          );
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
