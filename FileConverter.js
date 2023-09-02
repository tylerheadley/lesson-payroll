const fileInput = document.getElementById('file');
const button = document.getElementById('button');
let output = "";
button.onclick = function() {
    const fileList = fileInput.files;
    const reader = new FileReader();
    const payPeriodStart = new Date(document.getElementById('start').value);
    const payPeriodEnd = new Date(document.getElementById('end').value);
    payPeriodStart.setDate(payPeriodStart.getDate() + 1);
    payPeriodEnd.setDate(payPeriodEnd.getDate() + 1);
    const payPeriodDates = dates(payPeriodStart, payPeriodEnd);
    reader.onload = function () {
        output = reader.result;

        const rows = parseCSVText(output, payPeriodDates);
        createNewCSV(rows, payPeriodDates);
    };
    if(fileList[0]) {
    // This does not return the text. It just starts reading.
    // The onload handler is triggered when it is done and the result is available.
        reader.readAsText(fileList[0]);
        // console.log(output);
    }

};

function parseCSVText(csvString, payPeriodDates) {
    console.log(payPeriodDates);

    const rows = [];

    const rowData = csvString.split("\" \"");

    for (let i = 0; i < rowData.length; i++) {
        const lessons = rowData[i].split("\n");

        // console.log(lessons);

        if (lessons.length > 2) {
            let firstLesson = lessons[3].split(",");
            if (i == 0) {
                firstLesson = lessons[2].split(",");
            }

            const row = {
                title: firstLesson[0],
                employee: firstLesson[1],
                hoursPerDay: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                total: 0,
                rate: firstLesson[0] === "\"1:1 Swim Coaching\"" ? 35.00 : 30.00,
                earnings: 0,
                toString() {
                    return `${this.title},${this.employee},${this.hoursPerDay.join(",")},${this.total},${this.rate},${this.earnings}`;
                }
            };

            // console.log(lessons);

            for (let j = 2; j < lessons.length; j++) {
                const lessonData = lessons[j].split(",");

                if (lessonData.length > 1) {
                    // console.log(lessonData[3]);
                    // console.log(lessonData[4]);
                    const lessonLength = timeDiff(lessonData[3], lessonData[4]);
                    if (lessonLength !== NaN) {
                        row.hoursPerDay[payPeriodDates[lessonData[2]]] += lessonLength;
                    }
                }
            }

            row.total = row.hoursPerDay.reduce((sum, curr) => sum + curr, 0);

            row.earnings = row.total * row.rate;

            rows.push(row);
        }

        

    }

    return rows;
}

function createNewCSV(rows, payPeriodDates) {
    let csvContent = "data:text/csv;charset=utf-8," + `"Title","Employee",${Object.keys(payPeriodDates).join(",")},"Total","Rate","Earnings"\n` + rows.map(row => row.toString()).join("\n");

    // console.log(csvContent);

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payroll.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "payroll.csv".
}

function dates(payPeriodStart, payPeriodEnd) {
    console.log(payPeriodStart, payPeriodEnd);

    const payPeriodDates = {};

    let monthStr = String(payPeriodStart.getMonth() + 1);
    if (monthStr < 10) {
        monthStr = "0" + monthStr;
    }

    const yearStr = String(payPeriodStart.getFullYear());

    let index = 0;
    for (let day = payPeriodStart.getDate(); day <= payPeriodEnd.getDate(); day++) {
        let dayStr = String(day);
        if (dayStr < 10) {
            dayStr = "0" + dayStr;
        }

        payPeriodDates[monthStr + "/" + dayStr + "/" + yearStr] = index;
        index++;
    }

    console.log(payPeriodDates);

    return payPeriodDates;
}

function timeDiff(startTime, endTime) {
    const startTimeHour = parseInt(startTime.slice(1,3));
    const startTimeMin = parseInt(startTime.slice(4,6));
    const endTimeHour = parseInt(endTime.slice(1,3));
    const endTimeMin = parseInt(endTime.slice(4,6));
    let diff = (endTimeHour - startTimeHour) + ((endTimeMin - startTimeMin) / 60);
    if (diff < 0) {
        diff += 12;
    }
    return diff;
}

