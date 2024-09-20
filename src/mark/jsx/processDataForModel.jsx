//import TrackedEntityDetails from TrackedEntityDetails


/*const processDataForModel = (data) => {
    let inputs = [];

    data.forEach(instance => {
        let input = [];

        // Example of extracting features from top level instance
        input.push(instance.program);
        input.push(instance.orgUnit);
        input.push(instance.status === "ACTIVE" ? 1 : 0); // Example encoding for status

        // Example: Loop through events and extract relevant data
        instance.events.forEach(event => {
            input.push(new Date(event.eventDate).getTime()); // Convert event date to timestamp
            event.dataValues.forEach(dataValue => {
                input.push(dataValue.value); // Include value, you might need to encode it further
            });
        });

        inputs.push(input);
    });

    return inputs;
};
*/

// Use this data in your React app for model input
//const modelInputs = processDataForModel(instanceDetails);

