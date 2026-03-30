@extends('layouts.app')

@section('title', 'Register - EVAQReady')
@section('content')
<div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-700 via-blue-700 to-blue-600">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden animate-subtle-float">
        <div class="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <p class="text-xs font-semibold text-blue-800 tracking-wide uppercase">EVAQReady</p>
            <h2 class="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">Register As</h2>
            <p class="text-xs text-slate-600 mt-1">
                Choose your role and set up your EVAQReady profile. Required fields: name, email, and password.
            </p>

                <div class="mt-6">
                <label for="role" class="block text-xs font-semibold text-slate-800 mb-1.5">Choose your role</label>
                <select id="role" name="role" class="w-full h-6 rounded-lg border border-slate-300 px-3 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                    <option value="">Select your role</option>
                    <option value="evacuee">Evacuee</option>
                    <option value="responder">Responder</option>
                </select>
            </div>
        </div>

        <form method="POST" action="{{ route('register') }}" class="p-3 md:p-4 space-y-1.5"
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="space-y-1">
                    <label for="name" class="block text-xs font-semibold text-slate-800">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value="{{ old('name') }}"
                        required
                        autocomplete="name"
                        placeholder="Enter your full name"
                        class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition
                        {{ $errors->has('name') ? 'border-red-400 focus:ring-red-200' : '' }}"
                    >
                    @error('name')
                        <p class="text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="space-y-1">
                    <label for="gender" class="block text-xs font-semibold text-slate-800">Gender</label>
                    <select id="gender" name="gender" class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                        <option value="">Select gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="prefer_not">Prefer not to say</option>
                    </select>
                </div>

                <div class="space-y-1">
                    <label for="age" class="block text-xs font-semibold text-slate-800">Age</label>
                    <input
                        id="age"
                        type="number"
                        name="age"
                        min="0"
                        max="120"
                        value="{{ old('age') }}"
                        placeholder="Enter your age"
                        class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                    >
                    <div id="age-category-badge" class="text-xs font-semibold text-blue-600 mt-0.25">
                        Age category: -
                    </div>
                    <label class="flex items-center gap-2 mt-1 text-xs font-medium text-slate-800 cursor-pointer">
                        <input
                            id="is_pwd"
                            type="checkbox"
                            name="is_pwd"
                            value="1"
                            class="h-3.5 w-3.5 rounded border-slate-300 text-blue-700 focus:ring-blue-300 cursor-pointer"
                        >
                        <span>PWD</span>
                    </label>
                </div>

                <div class="space-y-1">
                    <label for="email" class="block text-xs font-semibold text-slate-800">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value="{{ old('email') }}"
                        required
                        autocomplete="username"
                        placeholder="name@example.com"
                        class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition
                        {{ $errors->has('email') ? 'border-red-400 focus:ring-red-200' : '' }}"
                    >
                    @error('email')
                        <p class="text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label for="password" class="block text-xs font-semibold text-slate-800">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        autocomplete="new-password"
                        placeholder="Enter password"
                        class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition
                        {{ $errors->has('password') ? 'border-red-400 focus:ring-red-200' : '' }}"
                    >
                    <div class="mt-1">
                        <div class="flex items-center justify-between gap-2">
                            <p class="text-xs font-semibold text-slate-600">Password Strength</p>
                            <span id="password-strength-label" class="text-xs font-bold text-slate-700">Weak</span>
                        </div>
                        <div class="h-1.5 mt-1 bg-slate-100 rounded-full overflow-hidden">
                            <div id="password-strength-bar" class="h-full w-0 bg-red-500 transition-all duration-300"></div>
                        </div>
                        <p id="password-strength-hint" class="text-[11px] text-slate-500 mt-1">Use 8+ chars, mix letters, numbers, and symbols.</p>
                    </div>
                    @error('password')
                        <p class="text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="space-y-1">
                    <label for="password_confirmation" class="block text-xs font-semibold text-slate-800">Confirm Password</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        required
                        autocomplete="new-password"
                        placeholder="Confirm password"
                        class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition
                        {{ $errors->has('password_confirmation') ? 'border-red-400 focus:ring-red-200' : '' }}"
                    >
                    @error('password_confirmation')
                        <p class="text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="space-y-1">
                    <label for="contact_number" class="block text-xs font-semibold text-slate-800">Contact Number</label>
                    <input
                        id="contact_number"
                        type="text"
                        name="contact_number"
                        value="{{ old('contact_number') }}"
                        placeholder="09XX-XXXX-XXXX"
                        class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                    >
                </div>

                <div class="space-y-1">
                    <label for="address" class="block text-xs font-semibold text-slate-800">Address</label>
                    <input
                        id="address"
                        type="text"
                        name="address"
                        value="{{ old('address') }}"
                        placeholder="Street address"
                        class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                    >
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="space-y-1">
                    <label for="barangay" class="block text-xs font-semibold text-slate-800">Barangay</label>
                    <select id="barangay" name="barangay" class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                        <option value="">Select barangay (Mati City)</option>
                        <option value="Badas">Badas</option>
                        <option value="Bobon">Bobon</option>
                        <option value="Buso">Buso</option>
                        <option value="Cabuaya">Cabuaya</option>
                        <option value="Central">Central</option>
                        <option value="Culian">Culian</option>
                        <option value="Dahican">Dahican</option>
                        <option value="Danao">Danao</option>
                        <option value="Dawan">Dawan</option>
                        <option value="Don Enrique Lopez">Don Enrique Lopez</option>
                        <option value="Don Martin Marundan">Don Martin Marundan</option>
                        <option value="Don Salvador Lopez">Don Salvador Lopez</option>
                        <option value="Langka">Langka</option>
                        <option value="Lawigan">Lawigan</option>
                        <option value="Libudon">Libudon</option>
                        <option value="Luban">Luban</option>
                        <option value="Macambol">Macambol</option>
                        <option value="Mamali">Mamali</option>
                        <option value="Matiao">Matiao</option>
                        <option value="Mayo">Mayo</option>
                        <option value="Sainz">Sainz</option>
                        <option value="Sanghay">Sanghay</option>
                        <option value="Tagabakid">Tagabakid</option>
                        <option value="Tagbinonga">Tagbinonga</option>
                        <option value="Taguibo">Taguibo</option>
                        <option value="Tamisan">Tamisan</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="space-y-1">
                    <label for="hazard_zone" class="block text-xs font-semibold text-slate-800">Hazard Zone</label>
                    <select id="hazard_zone" name="hazard_zone" class="w-full h-6 rounded-lg border border-slate-300 px-2.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                        <option value="">Not in hazard area</option>
                        <option value="flood">Flood-prone</option>
                        <option value="landslide">Landslide-prone</option>
                        <option value="typhoon">Typhoon-affected</option>
                        <option value="fire">Fire-affected</option>
                    </select>
                </div>

                <div class="flex items-center gap-2 pt-2">
                    <input id="pregnant" type="checkbox" name="pregnant" value="1" class="h-3.5 w-3.5 rounded border-slate-300 text-blue-700 focus:ring-blue-300 cursor-pointer">
                    <label for="pregnant" class="text-xs font-medium text-slate-800 cursor-pointer">Pregnant</label>
                </div>
            </div>

            <div class="rounded-lg border border-slate-300 bg-slate-50 p-2.5">
                <div class="flex items-center justify-between gap-2 mb-2">
                <p class="text-xs font-bold text-slate-800">Household Members</p>
                    <button type="button" id="add-member-btn" class="inline-flex items-center gap-1 text-blue-700 font-semibold hover:text-blue-900 transition text-xs">
                        <span class="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold">+</span>
                        Add
                    </button>
                </div>

                <!-- Header Row -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-1.5 mb-1.5 pb-1.5 border-b border-slate-200">
                    <div class="text-xs font-bold text-slate-700">Name</div>
                    <div class="text-xs font-bold text-slate-700">Age</div>
                    <div class="text-xs font-bold text-slate-700">Gender</div>
                    <div class="text-xs font-bold text-slate-700">Options</div>
                </div>

                <!-- Members Container -->
                <div id="members-container" class="space-y-1.5">
                    <div class="member-row grid grid-cols-1 md:grid-cols-4 gap-1.5 items-start" data-member-index="0">
                        <input type="text" name="members[0][name]" class="member-name w-full h-5 rounded-lg border border-slate-300 px-2 py-0 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" placeholder="Juan dela Cruz">

                        <div>
                            <input type="number" name="members[0][age]" min="0" max="120" class="member-age w-full h-5 rounded-lg border border-slate-300 px-2 py-0 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" placeholder="Age">
                            <div class="member-age-badge text-xs text-blue-600 font-semibold mt-0.25" aria-live="polite">-</div>
                        </div>

                        <select name="members[0][gender]" class="member-gender w-full h-5 rounded-lg border border-slate-300 px-2 py-0 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                            <option value="">Select</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="prefer_not">Prefer not</option>
                        </select>

                        <div class="flex items-center gap-1">
                            <label class="flex items-center gap-1 text-xs font-medium text-slate-800 cursor-pointer flex-1">
                                <input type="checkbox" name="members[0][is_pwd]" value="1" class="member-is-pwd h-3 w-3 rounded border-slate-300 text-blue-700 focus:ring-blue-300 cursor-pointer">
                                <span>PWD</span>
                            </label>
                            <button type="button" class="member-remove text-red-600 hover:text-red-700 font-semibold text-xs">✕</button>
                        </div>
                    </div>
                </div>

                <p class="text-xs text-slate-600 mt-2 font-medium">Appears when a responder scans your QR.</p>
            </div>

            <button
                id="register-submit-btn"
                type="submit"
                class="w-full py-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-md transition"
            >
                <span id="register-submit-text">Create Account</span>
                <span
                    id="register-submit-spinner"
                    class="hidden ml-3 inline-block h-4 w-4 rounded-full border-2 border-white/70 border-t-white animate-spin align-middle"
                    aria-hidden="true"
                ></span>
            </button>
        </form>

        <div class="px-3 md:px-4 pb-3">
            <div class="text-center text-xs text-slate-600">
                Already have an account?
                <a href="{{ route('login') }}" class="text-blue-700 font-semibold hover:underline">Sign in</a>
            </div>
        </div>

        <script>
            document.addEventListener('DOMContentLoaded', function () {
                const addMemberBtn = document.getElementById('add-member-btn');
                const membersContainer = document.getElementById('members-container');
                if (!addMemberBtn || !membersContainer) return;

                // ===== UTILITIES =====
                function getAgeCategory(age) {
                    if (age === null || Number.isNaN(age)) return '-';
                    if (age < 18) return 'Child (≤17)';
                    if (age <= 59) return 'Adult (18-59)';
                    return 'Senior (60+)';
                }

                function updateAgeBadge(ageInput, pwdCheckbox, badgeEl) {
                    if (!badgeEl || !ageInput) return;
                    const age = ageInput.value ? Number(ageInput.value) : null;
                    const isPwd = pwdCheckbox?.checked;
                    const category = getAgeCategory(age);
                    badgeEl.textContent = isPwd && category !== '-' ? `${category} • PWD` : category;
                }

                function setupMemberRow(rowEl) {
                    const ageInput = rowEl.querySelector('.member-age');
                    const pwdCheckbox = rowEl.querySelector('.member-is-pwd');
                    const badgeEl = rowEl.querySelector('.member-age-badge');
                    const removeBtn = rowEl.querySelector('.member-remove');

                    const updateBadge = () => updateAgeBadge(ageInput, pwdCheckbox, badgeEl);
                    if (ageInput) ageInput.addEventListener('input', updateBadge);
                    if (pwdCheckbox) pwdCheckbox.addEventListener('change', updateBadge);
                    if (removeBtn) removeBtn.addEventListener('click', () => rowEl.remove());

                    updateBadge();
                }

                // ===== SUBMIT BUTTON LOADING =====
                const submitBtn = document.getElementById('register-submit-btn');
                const submitText = document.getElementById('register-submit-text');
                const submitSpinner = document.getElementById('register-submit-spinner');
                const formEl = submitBtn?.closest('form');

                if (formEl && submitBtn && submitText && submitSpinner) {
                    formEl.addEventListener('submit', function () {
                        submitBtn.disabled = true;
                        submitText.textContent = 'Creating...';
                        submitSpinner.classList.remove('hidden');
                        submitBtn.classList.add('opacity-90', 'cursor-not-allowed');
                    }, { once: true });
                }

                // ===== PASSWORD STRENGTH INDICATOR =====
                const passwordEl = document.getElementById('password');
                const pwdLabelEl = document.getElementById('password-strength-label');
                const pwdBarEl = document.getElementById('password-strength-bar');

                if (passwordEl && pwdLabelEl && pwdBarEl) {
                    const updateStrength = () => {
                        const pwd = passwordEl.value || '';
                        const checks = [
                            pwd.length >= 8,
                            pwd.length >= 12,
                            /[a-z]/.test(pwd),
                            /[A-Z]/.test(pwd),
                            /[0-9]/.test(pwd),
                            /[^A-Za-z0-9]/.test(pwd),
                        ];
                        const score = checks.filter(Boolean).length;
                        const width = (score / 6) * 100;

                        let label = 'Weak', color = '#ef4444', pulse = true;
                        if (score >= 5) {
                            label = 'Strong';
                            color = '#10b981';
                            pulse = false;
                        } else if (score >= 3) {
                            label = 'Fair';
                            color = '#f59e0b';
                            pulse = false;
                        }

                        pwdBarEl.style.width = width + '%';
                        pwdBarEl.style.backgroundColor = color;
                        pwdLabelEl.textContent = label;
                        pwdLabelEl.style.color = color;

                        pulse ? pwdBarEl.classList.add('animate-pulse') : pwdBarEl.classList.remove('animate-pulse');
                        pulse ? pwdLabelEl.classList.add('animate-pulse') : pwdLabelEl.classList.remove('animate-pulse');
                    };

                    passwordEl.addEventListener('input', updateStrength);
                    updateStrength();
                }

                // ===== EVACUEE AGE CATEGORY =====
                const evacueeAge = document.getElementById('age');
                const evacueePwd = document.getElementById('is_pwd');
                const evacueeAgeBadge = document.getElementById('age-category-badge');

                if (evacueeAge && evacueeAgeBadge) {
                    const update = () => updateAgeBadge(evacueeAge, evacueePwd, evacueeAgeBadge);
                    evacueeAge.addEventListener('input', update);
                    if (evacueePwd) evacueePwd.addEventListener('change', update);
                    update();
                }

                // ===== HOUSEHOLD MEMBERS =====
                function getNextMemberIndex() {
                    const rows = membersContainer.querySelectorAll('.member-row');
                    return rows.length > 0 ? Number(rows[rows.length - 1].getAttribute('data-member-index')) + 1 : 1;
                }

                function createMemberRow(index) {
                    const row = document.createElement('div');
                    row.className = 'member-row grid grid-cols-1 md:grid-cols-4 gap-1.5 items-start';
                    row.setAttribute('data-member-index', String(index));
                    row.innerHTML = `
                        <input type="text" name="members[${index}][name]" class="member-name w-full h-5 rounded-lg border border-slate-300 px-2 py-0 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" placeholder="Juan dela Cruz">
                        <div>
                            <input type="number" name="members[${index}][age]" min="0" max="120" class="member-age w-full h-5 rounded-lg border border-slate-300 px-2 py-0 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" placeholder="Age">
                            <div class="member-age-badge text-xs text-blue-600 font-semibold mt-0.25" aria-live="polite">-</div>
                        </div>
                        <select name="members[${index}][gender]" class="member-gender w-full h-5 rounded-lg border border-slate-300 px-2 py-0 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                            <option value="">Select</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="prefer_not">Prefer not</option>
                        </select>
                        <div class="flex items-center gap-1">
                            <label class="flex items-center gap-1 text-xs font-medium text-slate-800 cursor-pointer flex-1">
                                <input type="checkbox" name="members[${index}][is_pwd]" value="1" class="member-is-pwd h-3 w-3 rounded border-slate-300 text-blue-700 focus:ring-blue-300 cursor-pointer">
                                <span>PWD</span>
                            </label>
                            <button type="button" class="member-remove text-red-600 hover:text-red-700 font-semibold text-xs">✕</button>
                        </div>
                    `;
                    return row;
                }

                addMemberBtn.addEventListener('click', function () {
                    const newRow = createMemberRow(getNextMemberIndex());
                    membersContainer.appendChild(newRow);
                    setupMemberRow(newRow);
                });

                // Initialize existing member rows
                membersContainer.querySelectorAll('.member-row').forEach(row => setupMemberRow(row));
            });
        </script>
    </div>
</div>
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="space-y-2">
                            <label for="gender" class="block text-sm font-semibold text-slate-800">Gender</label>
                            <select id="gender" name="gender" class="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100">
                                <option value="">Select gender</option>
                                <option value="female" @selected(old('gender') === 'female')>Female</option>
                                <option value="male" @selected(old('gender') === 'male')>Male</option>
                                <option value="prefer_not" @selected(old('gender') === 'prefer_not')>Prefer not to say</option>
                            </select>
                        </div>

                        <div class="space-y-2">
                            <label for="age" class="block text-sm font-semibold text-slate-800">Age</label>
                            <input id="age" type="number" name="age" min="0" max="120" value="{{ old('age') }}" placeholder="Enter your age" class="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100">
                            <p id="age-category-badge" class="text-xs font-semibold text-blue-700">Age category: -</p>
                        </div>

                        <div class="space-y-2 md:col-span-2">
                            <label for="address" class="block text-sm font-semibold text-slate-800">Address</label>
                            <input id="address" type="text" name="address" value="{{ old('address') }}" placeholder="Street address" class="h-12 w-full rounded-2xl border bg-white px-4 text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 @error('address') border-red-400 focus:ring-red-100 @else border-slate-200 focus:ring-blue-100 @enderror">
                            @error('address') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
                        </div>

                        <div class="space-y-2">
                            <label for="barangay" class="block text-sm font-semibold text-slate-800">Barangay</label>
                            <select id="barangay" name="barangay" class="h-12 w-full rounded-2xl border bg-white px-4 text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 @error('barangay') border-red-400 focus:ring-red-100 @else border-slate-200 focus:ring-blue-100 @enderror">
                                <option value="">Select barangay (Mati City)</option>
                                @foreach ($barangays as $barangay)
                                    <option value="{{ $barangay }}" @selected(old('barangay') === $barangay)>{{ $barangay }}</option>
                                @endforeach
                            </select>
                            @error('barangay') <p class="text-sm text-red-600">{{ $message }}</p> @enderror
                        </div>

                        <div class="space-y-2">
                            <label for="hazard_zone" class="block text-sm font-semibold text-slate-800">Hazard zone</label>
                            <select id="hazard_zone" name="hazard_zone" class="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100">
                                <option value="">Not in hazard area</option>
                                <option value="flood" @selected(old('hazard_zone') === 'flood')>Flood-prone</option>
                                <option value="landslide" @selected(old('hazard_zone') === 'landslide')>Landslide-prone</option>
                                <option value="typhoon" @selected(old('hazard_zone') === 'typhoon')>Typhoon-affected</option>
                                <option value="fire" @selected(old('hazard_zone') === 'fire')>Fire-affected</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid gap-3 md:grid-cols-2">
                        <label class="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800">
                            <input id="is_pwd" type="checkbox" name="is_pwd" value="1" @checked(old('is_pwd')) class="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200">
                            <span>Person with disability (PWD)</span>
                        </label>

                        <label class="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800">
                            <input id="pregnant" type="checkbox" name="pregnant" value="1" @checked(old('pregnant')) class="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200">
                            <span>Pregnant</span>
                        </label>
                    </div>

                    <div class="rounded-3xl border border-slate-200 bg-white p-4">
                        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h4 class="text-base font-bold text-slate-900">Household members</h4>
                                <p class="mt-1 text-sm text-slate-600">Add at least one household member for evacuee accounts.</p>
                            </div>
                            <button type="button" id="add-member-btn" class="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200">
                                Add member
                            </button>
                        </div>

                        <div id="members-container" class="space-y-3">
                            <div class="member-row rounded-2xl border border-slate-200 bg-slate-50 p-3" data-member-index="0">
                                <div class="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                                    <div>
                                        <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Name</label>
                                        <input type="text" name="members[0][name]" value="{{ old('members.0.name') }}" class="member-name h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100" placeholder="Juan dela Cruz">
                                    </div>

                                    <div>
                                        <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Age</label>
                                        <input type="number" name="members[0][age]" min="0" max="120" value="{{ old('members.0.age') }}" class="member-age h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100" placeholder="Age">
                                        <p class="member-age-badge mt-1 text-xs font-semibold text-blue-700">-</p>
                                    </div>

                                    <div>
                                        <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Gender</label>
                                        <select name="members[0][gender]" class="member-gender h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100">
                                            <option value="">Select</option>
                                            <option value="female" @selected(old('members.0.gender') === 'female')>Female</option>
                                            <option value="male" @selected(old('members.0.gender') === 'male')>Male</option>
                                            <option value="prefer_not" @selected(old('members.0.gender') === 'prefer_not')>Prefer not</option>
                                        </select>
                                    </div>

                                    <div class="flex items-end gap-2">
                                        <label class="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800">
                                            <input type="checkbox" name="members[0][is_pwd]" value="1" @checked(old('members.0.is_pwd')) class="member-is-pwd h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200">
                                            <span>PWD</span>
                                        </label>
                                        <button type="button" class="member-remove inline-flex h-11 items-center rounded-2xl border border-red-200 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="flex flex-col gap-4 border-t border-slate-200 pt-2 md:flex-row md:items-center md:justify-between">
                    <p class="text-sm text-slate-600">
                        Already have an account?
                        <a href="{{ route('login') }}" class="font-semibold text-blue-700 hover:underline">Sign in</a>
                    </p>

                    <button id="register-submit-btn" type="submit" class="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
                        <span id="register-submit-text">Create Account</span>
                        <span id="register-submit-spinner" class="ml-3 hidden h-4 w-4 rounded-full border-2 border-white/70 border-t-white animate-spin" aria-hidden="true"></span>
                    </button>
                </div>
            </form>
        </section>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const formEl = document.getElementById('register-form');
        const submitBtn = document.getElementById('register-submit-btn');
        const submitText = document.getElementById('register-submit-text');
        const submitSpinner = document.getElementById('register-submit-spinner');
        const passwordEl = document.getElementById('password');
        const passwordConfirmationEl = document.getElementById('password_confirmation');
        const passwordStrengthLabelEl = document.getElementById('password-strength-label');
        const passwordStrengthBarEl = document.getElementById('password-strength-bar');
        const passwordMatchHintEl = document.getElementById('password-match-hint');
        const roleInputs = document.querySelectorAll('input[name="role"]');
        const evacueeFieldsEl = document.getElementById('evacuee-fields');
        const addMemberBtn = document.getElementById('add-member-btn');
        const membersContainer = document.getElementById('members-container');
        const ageEl = document.getElementById('age');
        const ageBadgeEl = document.getElementById('age-category-badge');
        const isPwdEl = document.getElementById('is_pwd');

        function getSelectedRole() {
            const selectedRole = document.querySelector('input[name="role"]:checked');
            return selectedRole ? selectedRole.value : '';
        }

        function getAgeCategory(age) {
            if (age === null || Number.isNaN(age)) {
                return '-';
            }
            if (age < 18) {
                return 'Child (<=17)';
            }
            if (age <= 59) {
                return 'Adult (18-59)';
            }
            return 'Senior (60+)';
        }

        function updateEvacueeSections() {
            if (!evacueeFieldsEl) {
                return;
            }

            const isEvacuee = getSelectedRole() === 'evacuee';
            evacueeFieldsEl.classList.toggle('hidden', !isEvacuee);

            evacueeFieldsEl.querySelectorAll('input, select').forEach(function (field) {
                if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
                    return;
                }

                if (field.name === 'address' || field.name === 'barangay') {
                    field.required = isEvacuee;
                }

                if (field.classList.contains('member-name')) {
                    field.required = isEvacuee;
                }
            });
        }

        function updatePasswordStrength() {
            if (!passwordEl || !passwordStrengthLabelEl || !passwordStrengthBarEl) {
                return;
            }

            const password = passwordEl.value;
            const checks = [
                password.length >= 8,
                password.length >= 12,
                /[a-z]/.test(password),
                /[A-Z]/.test(password),
                /[0-9]/.test(password),
                /[^A-Za-z0-9]/.test(password),
            ];
            const score = checks.filter(Boolean).length;
            const width = (score / 6) * 100;

            let label = 'Weak';
            let color = '#ef4444';

            if (score >= 5) {
                label = 'Strong';
                color = '#10b981';
            } else if (score >= 3) {
                label = 'Fair';
                color = '#f59e0b';
            }

            passwordStrengthLabelEl.textContent = label;
            passwordStrengthLabelEl.style.color = color;
            passwordStrengthBarEl.style.width = width + '%';
            passwordStrengthBarEl.style.backgroundColor = color;
        }

        function updatePasswordMatch() {
            if (!passwordEl || !passwordConfirmationEl || !passwordMatchHintEl) {
                return;
            }

            if (passwordConfirmationEl.value === '') {
                passwordMatchHintEl.textContent = 'Re-enter the same password to confirm it.';
                passwordMatchHintEl.className = 'text-xs font-medium text-slate-500';
                return;
            }

            if (passwordEl.value === passwordConfirmationEl.value) {
                passwordMatchHintEl.textContent = 'Passwords match.';
                passwordMatchHintEl.className = 'text-xs font-medium text-green-600';
                return;
            }

            passwordMatchHintEl.textContent = 'Passwords do not match yet.';
            passwordMatchHintEl.className = 'text-xs font-medium text-red-600';
        }

        function updateEvacueeAgeBadge() {
            if (!ageEl || !ageBadgeEl) {
                return;
            }

            const age = ageEl.value ? Number(ageEl.value) : null;
            const category = getAgeCategory(age);
            const isPwd = isPwdEl ? isPwdEl.checked : false;
            ageBadgeEl.textContent = isPwd && category !== '-' ? 'Age category: ' + category + ' • PWD' : 'Age category: ' + category;
        }

        function updateMemberAgeBadge(rowEl) {
            const ageInput = rowEl.querySelector('.member-age');
            const isPwdInput = rowEl.querySelector('.member-is-pwd');
            const badgeEl = rowEl.querySelector('.member-age-badge');

            if (!ageInput || !badgeEl) {
                return;
            }

            const age = ageInput.value ? Number(ageInput.value) : null;
            const category = getAgeCategory(age);
            const isPwd = isPwdInput ? isPwdInput.checked : false;
            badgeEl.textContent = isPwd && category !== '-' ? category + ' • PWD' : category;
        }

        function bindMemberRow(rowEl) {
            const ageInput = rowEl.querySelector('.member-age');
            const isPwdInput = rowEl.querySelector('.member-is-pwd');
            const removeBtn = rowEl.querySelector('.member-remove');

            if (ageInput) {
                ageInput.addEventListener('input', function () {
                    updateMemberAgeBadge(rowEl);
                });
            }

            if (isPwdInput) {
                isPwdInput.addEventListener('change', function () {
                    updateMemberAgeBadge(rowEl);
                });
            }

            if (removeBtn) {
                removeBtn.addEventListener('click', function () {
                    const rows = membersContainer ? membersContainer.querySelectorAll('.member-row') : [];
                    if (rows.length <= 1) {
                        rowEl.querySelectorAll('input').forEach(function (input) {
                            if (input.type === 'checkbox') {
                                input.checked = false;
                            } else {
                                input.value = '';
                            }
                        });

                        const genderSelect = rowEl.querySelector('.member-gender');
                        if (genderSelect) {
                            genderSelect.value = '';
                        }

                        updateMemberAgeBadge(rowEl);
                        return;
                    }

                    rowEl.remove();
                });
            }

            updateMemberAgeBadge(rowEl);
        }

        function getNextMemberIndex() {
            if (!membersContainer) {
                return 0;
            }

            const rows = membersContainer.querySelectorAll('.member-row');
            return rows.length > 0 ? Number(rows[rows.length - 1].getAttribute('data-member-index')) + 1 : 0;
        }

        function createMemberRow(index) {
            const row = document.createElement('div');
            row.className = 'member-row rounded-2xl border border-slate-200 bg-slate-50 p-3';
            row.setAttribute('data-member-index', String(index));
            row.innerHTML = `
                <div class="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                    <div>
                        <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Name</label>
                        <input type="text" name="members[${index}][name]" class="member-name h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100" placeholder="Juan dela Cruz">
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Age</label>
                        <input type="number" name="members[${index}][age]" min="0" max="120" class="member-age h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100" placeholder="Age">
                        <p class="member-age-badge mt-1 text-xs font-semibold text-blue-700">-</p>
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Gender</label>
                        <select name="members[${index}][gender]" class="member-gender h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100">
                            <option value="">Select</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="prefer_not">Prefer not</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <label class="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800">
                            <input type="checkbox" name="members[${index}][is_pwd]" value="1" class="member-is-pwd h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200">
                            <span>PWD</span>
                        </label>
                        <button type="button" class="member-remove inline-flex h-11 items-center rounded-2xl border border-red-200 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">Remove</button>
                    </div>
                </div>
            `;
            return row;
        }

        document.querySelectorAll('[data-toggle-password]').forEach(function (button) {
            button.addEventListener('click', function () {
                const inputId = button.getAttribute('data-toggle-password');
                const input = inputId ? document.getElementById(inputId) : null;
                if (!input) {
                    return;
                }

                const shouldShowPassword = input.type === 'password';
                input.type = shouldShowPassword ? 'text' : 'password';
                button.textContent = shouldShowPassword ? 'Hide' : 'Show';
            });
        });

        roleInputs.forEach(function (input) {
            input.addEventListener('change', updateEvacueeSections);
        });

        if (passwordEl) {
            passwordEl.addEventListener('input', updatePasswordStrength);
            passwordEl.addEventListener('input', updatePasswordMatch);
        }

        if (passwordConfirmationEl) {
            passwordConfirmationEl.addEventListener('input', updatePasswordMatch);
        }

        if (ageEl) {
            ageEl.addEventListener('input', updateEvacueeAgeBadge);
        }

        if (isPwdEl) {
            isPwdEl.addEventListener('change', updateEvacueeAgeBadge);
        }

        if (membersContainer) {
            membersContainer.querySelectorAll('.member-row').forEach(function (rowEl) {
                bindMemberRow(rowEl);
            });
        }

        if (addMemberBtn && membersContainer) {
            addMemberBtn.addEventListener('click', function () {
                const row = createMemberRow(getNextMemberIndex());
                membersContainer.appendChild(row);
                bindMemberRow(row);
                updateEvacueeSections();
            });
        }

        if (formEl && submitBtn && submitText && submitSpinner) {
            formEl.addEventListener('submit', function (event) {
                if (getSelectedRole() === 'evacuee' && membersContainer) {
                    const validMembers = Array.from(membersContainer.querySelectorAll('.member-name')).filter(function (input) {
                        return input.value.trim() !== '';
                    });

                    if (validMembers.length === 0) {
                        event.preventDefault();
                        window.alert('Please add at least one household member for an evacuee account.');
                        return;
                    }
                }

                submitBtn.disabled = true;
                submitText.textContent = 'Creating account...';
                submitSpinner.classList.remove('hidden');
                submitBtn.classList.add('cursor-not-allowed', 'opacity-90');
            }, { once: true });
        }

        updatePasswordStrength();
        updatePasswordMatch();
        updateEvacueeAgeBadge();
        updateEvacueeSections();
    });
</script>
@endsection

