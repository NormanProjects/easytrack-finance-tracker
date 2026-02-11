import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DashboardView = 'overview' | 'transactions' | 'budget' | 'analytics' | 'settings' | 'categories';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  @Input() isOpen: boolean = true;
  @Input() activeView: string = 'overview';
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() viewChange = new EventEmitter<DashboardView>();

  navigate(view: DashboardView, event: Event) {
    event.preventDefault();
    this.viewChange.emit(view);
  }

  close() {
    this.closeSidebar.emit();
  }
}
