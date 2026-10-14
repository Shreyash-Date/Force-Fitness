const $ = (selector) => document.querySelector(selector);

const height = $("#height");
const weight = $("#weight");
const age = $("#age");
const gender = $("#gender");

const bmiText = $("#bmi");
const category = $("#category");
const healthy = $("#healthy");
const water = $("#water");
const calories = $("#calories");
const progress = $("#progress");
const pointer = $("#pointer");
const error = $("#error");

const circumference = 2 * Math.PI * 90; // ≈ 565.49, matches SVG circle r=90

let animationTimer = null;

function animateValue(element, target) {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }

    let current = 0;

    animationTimer = setInterval(() => {
        current += target / 40;

        if (current >= target) {
            current = target;
            clearInterval(animationTimer);
            animationTimer = null;
        }

        element.textContent = current.toFixed(1);
    }, 15);
}

function calculateBMI() {
    const h = parseFloat(height.value);
    const w = parseFloat(weight.value);
    const a = parseInt(age.value);

    if (isNaN(h) || isNaN(w) || isNaN(a) || h <= 0 || w <= 0 || a <= 0) {
        error.classList.remove("hidden");
        error.textContent = "Please fill all fields correctly.";
        return;
    }

    error.classList.add("hidden");

    const heightInMeters = h / 100;
    const bmi = w / (heightInMeters * heightInMeters);

    animateValue(bmiText, bmi);

    let bmiCategory;
    let colorClass;

    if (bmi < 18.5) {
        bmiCategory = "Underweight";
        colorClass = "text-blue-600";
    } else if (bmi < 25) {
        bmiCategory = "Normal";
        colorClass = "text-green-600";
    } else if (bmi < 30) {
        bmiCategory = "Overweight";
        colorClass = "text-yellow-500";
    } else {
        bmiCategory = "Obese";
        colorClass = "text-red-600";
    }

    category.textContent = bmiCategory;
    category.className = `font-bold text-xl mt-2 ${colorClass}`;

    // Circular Progress
    const percentage = Math.min(bmi, 40) / 40;

    progress.style.strokeDashoffset =
        circumference - (circumference * percentage);

    // Scale Pointer
    pointer.style.left = `calc(${percentage * 100}% - 12px)`;

    // Healthy Weight Range
    const minWeight = (18.5 * heightInMeters * heightInMeters).toFixed(1);
    const maxWeight = (24.9 * heightInMeters * heightInMeters).toFixed(1);

    healthy.textContent = `${minWeight} - ${maxWeight} kg`;

    // Water Intake Recommendation
    water.textContent = `${(w * 0.035).toFixed(1)} L`;

    // Maintenance Calories (BMR × 1.4)
    let bmr;

    if (gender.value === "Male") {
        bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
        bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }

    calories.textContent = `${Math.round(bmr * 1.4)} kcal`;
}

$("#calc").addEventListener("click", calculateBMI);

$("#clear").addEventListener("click", () => {
    height.value = "";
    weight.value = "";
    age.value = "";

    bmiText.textContent = "--";
    category.textContent = "---";

    // Remove category color classes
    category.className = "font-bold text-xl mt-2";

    healthy.textContent = "--";
    water.textContent = "--";
    calories.textContent = "--";

    progress.style.strokeDashoffset = circumference;
    pointer.style.left = "0";

    error.classList.add("hidden");
});

// Press Enter to Calculate
[height, weight, age].forEach((input) => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            calculateBMI();
        }
    });
});