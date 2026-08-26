import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/models/role.model';
import { Circle, CircleSlot, CircleStatus } from '../../models/circle.model';
import { CircleRegistryService } from '../../services/circle-registry.service';
import { ConfirmationService } from 'primeng/api';

type RegistryFilter = 'All' | CircleStatus;

@Component({
  selector: 'app-circle-registry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circle-registry.component.html',
  styleUrls: ['../../circle-management.shared.scss', './circle-registry.component.scss'],
})
export class CircleRegistryComponent {
  private readonly service = inject(CircleRegistryService);
  private readonly auth = inject(AuthService);
  private readonly confirmation = inject(ConfirmationService);

  readonly circles = signal<Circle[]>([]);
  readonly selectedCircle = signal<Circle | null>(null);
  readonly slots = signal<CircleSlot[]>([]);
  readonly selectedFilter = signal<RegistryFilter>('All');
  readonly filters: RegistryFilter[] = ['All', 'Open', 'InRecruitment', 'Filled', 'Closed'];
  readonly isLoading = signal(true);
  readonly isLoadingSlots = signal(false);
  readonly slotActionInFlight = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isAdmin = this.auth.hasRole(Role.Admin);

  readonly approvedSlotCount = computed(() =>
    this.circles().reduce((total, circle) => total + circle.approvedSlots, 0)
  );
  readonly filledSlotCount = computed(() =>
    this.circles().reduce((total, circle) => total + circle.filledCount, 0)
  );
  readonly availableSlotCount = computed(() =>
    this.circles().reduce(
      (total, circle) => total + Math.max(0, circle.approvedSlots - circle.filledCount),
      0
    )
  );

  constructor() {
    this.loadCircles();
  }

  loadCircles(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const filter = this.selectedFilter();
    this.service.getAll(filter === 'All' ? undefined : filter).subscribe({
      next: (circles) => {
        this.circles.set(circles);
        this.isLoading.set(false);
        const currentId = this.selectedCircle()?.circleId;
        const nextSelected = circles.find((circle) => circle.circleId === currentId) ?? circles[0] ?? null;
        this.selectedCircle.set(nextSelected);
        if (nextSelected) this.loadSlots(nextSelected.circleId);
        else this.slots.set([]);
      },
      error: () => {
        this.errorMessage.set('The circle registry could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: RegistryFilter): void {
    this.selectedFilter.set(filter);
    this.selectedCircle.set(null);
    this.slots.set([]);
    this.loadCircles();
  }

  selectCircle(circle: Circle): void {
    this.selectedCircle.set(circle);
    this.successMessage.set(null);
    this.loadSlots(circle.circleId);
  }

  vacateSlot(slot: CircleSlot): void {
    const circle = this.selectedCircle();
    if (!circle || slot.status !== 'Assigned' || !this.isAdmin) return;
    this.confirmation.confirm({
      header: 'Vacate circle slot?',
      message: `Vacate slot ${slot.slotNumber} in ${circle.circleTitle}?`,
      icon: 'pi pi-user-minus',
      acceptLabel: 'Vacate Slot',
      rejectLabel: 'Keep Assigned',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.slotActionInFlight.set(slot.slotNumber);
        this.errorMessage.set(null);
        this.successMessage.set(null);
        this.service.vacateSlot(circle.circleId, slot.slotNumber).subscribe({
          next: (updated) => {
            this.slots.update((slots) =>
              slots.map((current) => current.slotNumber === updated.slotNumber ? updated : current)
            );
            this.slotActionInFlight.set(null);
            this.successMessage.set(`Slot ${slot.slotNumber} is now vacant.`);
            this.loadCircles();
          },
          error: (error) => {
            this.slotActionInFlight.set(null);
            this.errorMessage.set(error?.error?.detail ?? error?.error?.message ?? 'The slot could not be vacated.');
          },
        });
      },
    });
  }

  statusLabel(status: string): string {
    return status === 'InRecruitment' ? 'In Recruitment' : status;
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }

  private loadSlots(circleId: string): void {
    this.isLoadingSlots.set(true);
    this.service.getSlots(circleId).subscribe({
      next: (slots) => {
        this.slots.set([...slots].sort((a, b) => a.slotNumber - b.slotNumber));
        this.isLoadingSlots.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.isLoadingSlots.set(false);
        this.errorMessage.set('The selected circle slots could not be loaded.');
      },
    });
  }
}
