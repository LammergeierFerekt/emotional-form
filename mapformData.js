const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const radiusMap = {
    "super tare": 15, "tare": 10, "uneori": 8,
    "neutru": 5, "nu prea": 2, "deloc": 0
};

const emotionColors = {
    "Fericire": "#FFDF00", "Entuziasm": "#FF4500", "Calm": "#87CEFA",
    "Mulțumire": "#90EE90", "Iubire": "#FF1493", "Speranță": "#ADD8E6",
    "Seninătate": "#E0FFFF", "Neutralitate": "#A9A9A9", "Curiozitate": "#E6E6FA",
    "Tristețe": "#4682B4", "Frică": "#2F4F4F", "Furie": "#B22222",
    "Invidie": "#556B2F", "Singurătate": "#483D8B", "Vinovăție": "#800000",
    "Anxietate": "#CD5C5C", "Amărăciune": "#FF8C00", "Nostalgie": "#F0E68C",
    "Confuzie": "#808000", "Empatie": "#DA70D6", "Surpriză": "#FF69B4"
};

function mapFormData(formResponses) {
    return formResponses.map((response) => {
        const { sphere_name, emotion, radius_word, connections } = response;
        return {
            sphere_name,
            position: `"0,0,0"`, 
            radius: radiusMap[radius_word],
            sphere_color: emotionColors[emotion],
            connection: connections.map((c) => `${c.type === 'good' ? '>' : '<'}${c.target}`).join('; ')
        };
    });
}

const generateCSV = (mappedData) => {
    const csvWriter = createCsvWriter({
        path: path.join(__dirname, 'output.csv'), 
        header: [
            { id: 'sphere_name', title: 'sphere_name' },
            { id: 'position', title: 'position' },
            { id: 'radius', title: 'radius' },
            { id: 'sphere_color', title: 'sphere_color' },
            { id: 'connection', title: 'connection' }
        ],
    });

    csvWriter.writeRecords(mappedData)
        .then(() => console.log('CSV file written successfully'))
        .catch(err => console.error('Error writing CSV:', err));
};

module.exports = { mapFormData, generateCSV };
