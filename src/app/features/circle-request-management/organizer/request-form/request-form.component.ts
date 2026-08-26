import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Circle, CircleSlot } from '../../models/circle.model';
import { CircleType } from '../../models/circle-request.model';
import { CircleRegistryService } from '../../services/circle-registry.service';
import { CircleRequestService } from '../../services/circle-request.service';

@Component({
  selector: 'app-circle-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './request-form.component.html',
  styleUrls: ['../../circle-management.shared.scss', './request-form.component.scss'],
})
export class RequestFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestService = inject(CircleRequestService);
  private readonly registryService = inject(CircleRegistryService);

  readonly requestId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = signal(Boolean(this.requestId));
  readonly isLoading = signal(Boolean(this.requestId));
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly circles = signal<Circle[]>([]);
  readonly slots = signal<CircleSlot[]>([]);
  readonly isLoadingSlots = signal(false);

  readonly form = this.fb.group({
    requestType: this.fb.nonNullable.control<CircleType>('NewCircle', Validators.required),
    circleTitle: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(128)]),
    contributionAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    duration: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    numberOfSlots: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    existingCircleId: this.fb.nonNullable.control(''),
    vacantSlotNumber: this.fb.control<number | null>(null),
    shortJustification: this.fb.nonNullable.control('', Validators.maxLength(500)),
  });

  constructor() {
    this.loadCircles();
    this.form.controls.requestType.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
      this.applyTypeValidation();
    });
    this.form.controls.existingCircleId.valueChanges.subscribe((circleId) => {
      if (this.form.controls.requestType.value === 'Replacement' && circleId) {
        this.loadSlots(circleId);
      } else {
        this.slots.set([]);
      }
    });
    this.applyTypeValidation();

    if (this.requestId) {
      this.loadRequest(this.requestId);
    }
  }

  get isReplacement(): boolean {
    return this.form.controls.requestType.value === 'Replacement';
  }

  saveDraft(): void {
    this.errorMessage.set(null);
    this.applyTypeValidation();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please complete all required request information.');
      return;
    }

    this.isSaving.set(true);
    const value = this.form.getRawValue();
    const request$ = value.requestType === 'NewCircle'
      ? (this.requestId
          ? this.requestService.updateNew(this.requestId, {
              circleTitle: value.circleTitle.trim(),
              contributionAmount: Number(value.contributionAmount),
              duration: Number(value.duration),
              numberOfSlots: Number(value.numberOfSlots),
              shortJustification: value.shortJustification.trim(),
            })
          : this.requestService.createNew({
              circleTitle: value.circleTitle.trim(),
              contributionAmount: Number(value.contributionAmount),
              duration: Number(value.duration),
              numberOfSlots: Number(value.numberOfSlots),
              shortJustification: value.shortJustification.trim(),
            }))
      : (this.requestId
          ? this.requestService.updateReplacement(this.requestId, {
              existingCircleId: value.existingCircleId,
              vacantSlotNumber: Number(value.vacantSlotNumber),
              shortJustification: value.shortJustification.trim() || null,
            })
          : this.requestService.createReplacement({
              existingCircleId: value.existingCircleId,
              vacantSlotNumber: Number(value.vacantSlotNumber),
              shortJustification: value.shortJustification.trim() || null,
            }));

    request$.subscribe({
      next: (request) => {
        this.isSaving.set(false);
        this.router.navigate(['/console/circle-requests', request.requestId]);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(this.backendMessage(error, 'The request could not be saved.'));
      },
    });
  }

  private applyTypeValidation(): void {
    const controls = this.form.controls;
    if (controls.requestType.value === 'NewCircle') {
      controls.circleTitle.setValidators([Validators.required, Validators.maxLength(128)]);
      controls.contributionAmount.setValidators([Validators.required, Validators.min(0.01)]);
      controls.duration.setValidators([Validators.required, Validators.min(1)]);
      controls.numberOfSlots.setValidators([Validators.required, Validators.min(1)]);
      controls.shortJustification.setValidators([Validators.required, Validators.maxLength(500)]);
      controls.existingCircleId.clearValidators();
      controls.vacantSlotNumber.clearValidators();
    } else {
      controls.circleTitle.clearValidators();
      controls.contributionAmount.clearValidators();
      controls.duration.clearValidators();
      controls.numberOfSlots.clearValidators();
      controls.shortJustification.setValidators(Validators.maxLength(500));
      controls.existingCircleId.setValidators(Validators.required);
      controls.vacantSlotNumber.setValidators([Validators.required, Validators.min(1)]);
    }

    Object.values(controls).forEach((control) => control.updateValueAndValidity({ emitEvent: false }));
  }

  private loadRequest(id: string): void {
    this.requestService.getById(id).subscribe({
      next: (request) => {
        if (request.requestStatus !== 'Draft' && request.requestStatus !== 'ModificationRequested') {
          this.router.navigate(['/console/circle-requests', id]);
          return;
        }

        this.form.patchValue({
          requestType: request.circleType,
          circleTitle: request.circleTitle,
          contributionAmount: request.contributionAmount,
          duration: request.duration,
          numberOfSlots: request.numberOfSlots,
          existingCircleId: request.existingCircleId ?? '',
          vacantSlotNumber: request.vacantSlotNumber,
          shortJustification: request.shortJustification ?? '',
        });
        this.applyTypeValidation();
        if (request.circleType === 'Replacement' && request.existingCircleId) {
          this.loadSlots(request.existingCircleId);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('The selected circle request could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }

  private loadCircles(): void {
    this.registryService.getAll().subscribe({
      next: (circles) => this.circles.set(circles),
      error: () => this.circles.set([]),
    });
  }

  private loadSlots(circleId: string): void {
    this.isLoadingSlots.set(true);
    this.registryService.getSlots(circleId).subscribe({
      next: (slots) => {
        this.slots.set(slots.filter((slot) => slot.status === 'Vacant'));
        this.isLoadingSlots.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.isLoadingSlots.set(false);
      },
    });
  }

  private backendMessage(error: any, fallback: string): string {
    const validation = error?.error?.errors;
    if (validation) {
      const messages = Object.values(validation).flat() as string[];
      if (messages.length) return messages.join(' ');
    }
    return error?.error?.detail ?? error?.error?.message ?? fallback;
  }
}

