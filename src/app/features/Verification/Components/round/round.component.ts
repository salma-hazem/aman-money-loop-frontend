import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VerificationRoundService } from '../../Services/round.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  VerificationFormat,
  VerificationRoundResponse,
  VerificationCriterionResponse,
  CreateVerificationRound,
  UpdateVerificationRound
} from '../../Models/round.model';

@Component({
  selector: 'app-verification-round',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './round.component.html',
  styleUrl: './round.component.scss'
})
export class VerificationRoundComponent implements OnInit {
  circleId: string = '';
  rounds: VerificationRoundResponse[] = [];

  isLoading: boolean = true;
  errorMessage: string = '';
  isSaving: boolean = false;

  isFormVisible: boolean = false;
  editingRoundId: string | null = null;
  roundForm!: FormGroup;

  // Make enum available to the template
  VerificationFormat = VerificationFormat;
  formatOptions = [
    { label: 'In Person', value: VerificationFormat.InPerson },
    { label: 'Video Call', value: VerificationFormat.Video },
    { label: 'Phone Call', value: VerificationFormat.Phone }
  ];

  constructor(
    private fb: FormBuilder,
    private roundService: VerificationRoundService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.circleId = this.route.snapshot.paramMap.get('circleId') || '';

    if (!this.circleId) {
      this.errorMessage = 'Circle ID is missing from the route.';
      this.isLoading = false;
      return;
    }

    this.loadRounds();
  }

  private initForm(): void {
    this.roundForm = this.fb.group({
      roundName: ['', Validators.required],
      format: [VerificationFormat.Video, Validators.required],
      criteria: this.fb.array([])
    });
  }

  get criteriaFormArray(): FormArray {
    return this.roundForm.get('criteria') as FormArray;
  }

  loadRounds(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.roundService.getRoundsByCircle(this.circleId).subscribe({
      next: (data) => {
        this.rounds = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load rounds', err);
        this.errorMessage = 'Failed to load verification rounds.';
        this.isLoading = false;
      }
    });
  }

  openCreateForm(): void {
    this.editingRoundId = null;
    this.isFormVisible = true;
    this.initForm();
    this.addCriterion();
  }

  openEditForm(round: VerificationRoundResponse): void {
    this.editingRoundId = round.verificationRoundId;
    this.isFormVisible = true;
    this.initForm();

    this.roundForm.patchValue({
      roundName: round.roundName,
      format: round.format
    });

    // Explicitly typed (c: VerificationCriterionResponse) to resolve TS7006 implicit any error
    round.criteria.forEach((c: VerificationCriterionResponse) => {
      this.criteriaFormArray.push(this.fb.group({
        verificationCriterionId: [c.verificationCriterionId],
        criterionName: [c.criterionName, Validators.required],
        weight: [c.weight, [Validators.required, Validators.min(1)]],
        displayOrder: [c.displayOrder, Validators.required],
        isActive: [c.isActive]
      }));
    });
  }

  cancelForm(): void {
    this.isFormVisible = false;
    this.editingRoundId = null;
  }

  addCriterion(): void {
    this.criteriaFormArray.push(this.fb.group({
      verificationCriterionId: [null],
      criterionName: ['', Validators.required],
      weight: [1, [Validators.required, Validators.min(1)]],
      displayOrder: [this.criteriaFormArray.length + 1, Validators.required],
      isActive: [true]
    }));
  }

  removeCriterion(index: number): void {
    this.criteriaFormArray.removeAt(index);
  }

  saveRound(): void {
    if (this.roundForm.invalid) {
      this.roundForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const currentUserId = this.authService.currentUser()?.id;

    if (this.editingRoundId) {
      const updatePayload: UpdateVerificationRound = {
        roundName: this.roundForm.value.roundName,
        format: Number(this.roundForm.value.format),
        criteria: this.roundForm.value.criteria
      };

      this.roundService.updateRound(this.editingRoundId, updatePayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.isFormVisible = false;
          this.loadRounds();
        },
        error: (err) => {
          console.error('Failed to update round', err);
          this.isSaving = false;
          alert('Error updating the round.');
        }
      });

    } else {
      if (!currentUserId) {
        alert('You must be logged in to create a round.');
        this.isSaving = false;
        return;
      }

      const createPayload: CreateVerificationRound = {
        circleId: this.circleId,
        reviewedByUserId: currentUserId,
        roundName: this.roundForm.value.roundName,
        format: Number(this.roundForm.value.format),
        criteria: this.roundForm.value.criteria
      };

      this.roundService.createRound(createPayload).subscribe({
        next: () => {
          this.isSaving = false;
          this.isFormVisible = false;
          this.loadRounds();
        },
        error: (err) => {
          console.error('Failed to create round', err);
          this.isSaving = false;
          alert('Error creating the round.');
        }
      });
    }
  }

  getFormatLabel(format: VerificationFormat): string {
    const option = this.formatOptions.find(o => o.value === format);
    return option ? option.label : 'Unknown';
  }
}
