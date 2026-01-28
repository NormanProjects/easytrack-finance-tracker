import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
//import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

  @Input() isOpen: boolean = true;
  @Output() closeSidebar = new EventEmitter<void>();

  activeItem: string = 'overview';

  navigate(item: string, event: Event) {
    event.preventDefault();
    this.activeItem = item;
    // Emit event to parent to change view
    // You can add @Output() navigateView = new EventEmitter<string>();
    // and emit this.navigateView.emit(item);
  }

  close() {
    this.closeSidebar.emit();
  }
 
}
