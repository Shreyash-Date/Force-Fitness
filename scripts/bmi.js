const height = document.querySelector('#height-value');
const weight = document.querySelector('#weight-value');
const calcBtn = document.querySelector('#calc-btn');
const finalBMI = document.querySelector('#final-bmi');

calcBtn.addEventListener('click', () => {
    const valueHeight = parseFloat(height.value);
    const valueWeight = parseFloat(weight.value);

    // check values 
    if (isNaN(valueHeight) || isNaN(valueWeight) || valueHeight <= 0 || valueWeight <= 0) {
        finalBMI.textContent = "Please enter valid height and weight";
        return;
    }

    // Calculate (height in cm, weight in kg)
    const heightInMeters = valueHeight / 100;
    const bmi = valueWeight / (heightInMeters * heightInMeters);
    const roundedBMI = bmi.toFixed(1);

    // Get category
    let category;
    if (bmi < 18.5) {
        category = "Underweight";
    } else if (bmi < 25) {
        category = "Normal";
    } else if (bmi < 30) {
        category = "Overweight";
    } else {
        category = "Obese";
    }

    // Display
    finalBMI.textContent = `${roundedBMI} (${category})`;
});