<?php

namespace App\Actions\Fortify;

use App\AgeGroup;
use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Support\MatiBarangays;
use App\Support\PwdTypeOptions;
use App\UserRole;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator as ValidationValidator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        $validator = Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'household_role' => ['required', 'string', Rule::in(['resident', 'respondent'])],
            'age' => ['required', 'integer', 'min:0', 'max:130'],
            'contact_number' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{7,20}$/'],
            'sex' => ['required', 'string', Rule::in(['male', 'female'])],
            'is_pwd' => ['required', 'boolean'],
            'pwd_type' => ['nullable', 'string', Rule::in(PwdTypeOptions::values())],
            'pwd_type_other' => ['nullable', 'string', 'max:255'],
            'barangay' => ['required', 'string', Rule::in(MatiBarangays::values())],
            'address' => ['required', 'string', 'max:500'],
            'members' => ['nullable', 'array', 'max:20'],
            'members.*.full_name' => ['required', 'string', 'max:255'],
            'members.*.age' => ['required', 'integer', 'min:0', 'max:130'],
            'members.*.sex' => ['required', 'string', Rule::in(['male', 'female'])],
            'members.*.is_pwd' => ['required', 'boolean'],
            'members.*.pwd_type' => ['nullable', 'string', Rule::in(PwdTypeOptions::values())],
            'members.*.pwd_type_other' => ['nullable', 'string', 'max:255'],
        ]);

        $validator->after(function (ValidationValidator $validator) use ($input): void {
            $this->validatePwdFields($validator, $input, '');

            foreach ($input['members'] ?? [] as $index => $member) {
                if (! is_array($member)) {
                    continue;
                }

                $this->validatePwdFields($validator, $member, "members.{$index}.");
            }
        });

        /** @var array{
         *     name: string,
         *     email: string,
         *     password: string,
         *     household_role: string,
         *     age: int,
         *     contact_number: string,
         *     sex: string,
         *     is_pwd: bool|int|string,
         *     pwd_type?: string|null,
         *     pwd_type_other?: string|null,
         *     barangay: string,
         *     address: string,
         *     members?: array<int, array{
         *         full_name: string,
         *         age: int,
         *         sex: string,
         *         is_pwd: bool|int|string,
         *         pwd_type?: string|null,
         *         pwd_type_other?: string|null
         *     }>
         * } $validated
         */
        $validated = $validator->validate();

        return DB::transaction(function () use ($validated): User {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => UserRole::Resident,
            ]);

            $isPwd = $this->booleanValue($validated['is_pwd']);

            $householdProfile = $user->householdProfile()->create([
                'household_role' => $validated['household_role'],
                'age' => $validated['age'],
                'age_group' => AgeGroup::fromAge($validated['age'])->value,
                'contact_number' => $validated['contact_number'],
                'sex' => $validated['sex'],
                'is_pwd' => $isPwd,
                'pwd_type' => $this->resolvedPwdType(
                    $isPwd,
                    $validated['pwd_type'] ?? null,
                    $validated['pwd_type_other'] ?? null,
                ),
                'pwd_type_other' => $this->resolvedPwdTypeOther(
                    $isPwd,
                    $validated['pwd_type'] ?? null,
                    $validated['pwd_type_other'] ?? null,
                ),
                'barangay' => $validated['barangay'],
                'address' => $validated['address'],
            ]);

            foreach (array_values($validated['members'] ?? []) as $index => $member) {
                $memberIsPwd = $this->booleanValue($member['is_pwd']);

                $householdProfile->members()->create([
                    'position' => $index + 1,
                    'full_name' => $member['full_name'],
                    'age' => $member['age'],
                    'age_group' => AgeGroup::fromAge($member['age'])->value,
                    'sex' => $member['sex'],
                    'is_pwd' => $memberIsPwd,
                    'pwd_type' => $this->resolvedPwdType(
                        $memberIsPwd,
                        $member['pwd_type'] ?? null,
                        $member['pwd_type_other'] ?? null,
                    ),
                    'pwd_type_other' => $this->resolvedPwdTypeOther(
                        $memberIsPwd,
                        $member['pwd_type'] ?? null,
                        $member['pwd_type_other'] ?? null,
                    ),
                ]);
            }

            return $user;
        });
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function validatePwdFields(
        ValidationValidator $validator,
        array $input,
        string $fieldPrefix,
    ): void {
        $isPwd = $this->booleanValue($input['is_pwd'] ?? false);
        $pwdType = is_string($input['pwd_type'] ?? null)
            ? trim($input['pwd_type'])
            : null;
        $pwdTypeOther = is_string($input['pwd_type_other'] ?? null)
            ? trim($input['pwd_type_other'])
            : null;

        if (! $isPwd) {
            return;
        }

        if ($pwdType === null || $pwdType === '') {
            $validator->errors()->add(
                "{$fieldPrefix}pwd_type",
                'Please select the PWD type.',
            );

            return;
        }

        if ($pwdType === 'other' && ($pwdTypeOther === null || $pwdTypeOther === '')) {
            $validator->errors()->add(
                "{$fieldPrefix}pwd_type_other",
                'Please specify the other PWD type.',
            );
        }
    }

    /**
     * @param  bool|int|string  $value
     */
    private function booleanValue(bool|int|string $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    private function resolvedPwdType(
        bool $isPwd,
        ?string $pwdType,
        ?string $pwdTypeOther,
    ): ?string {
        if (! $isPwd) {
            return null;
        }

        if ($pwdType === 'other') {
            return $pwdTypeOther;
        }

        return $pwdType;
    }

    private function resolvedPwdTypeOther(
        bool $isPwd,
        ?string $pwdType,
        ?string $pwdTypeOther,
    ): ?string {
        if (! $isPwd || $pwdType !== 'other') {
            return null;
        }

        return $pwdTypeOther;
    }
}



