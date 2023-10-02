function consoleEvents(receipt, eventInterface, eventSignature, eventName) {
  let eventIndex = -1;
  for (let i = 0; i < receipt.logs.length; i++) {
    if (receipt.logs[i].topics[0] === eventSignature) {
      eventIndex = i;
      break;
    }
  }
  if (eventIndex === -1) {
    console.log("No Events");
    process.exit();
  }
  const data = receipt.logs[eventIndex].data;
  const topics = receipt.logs[eventIndex].topics;
  const event = eventInterface.decodeEventLog(eventName, data, topics);
  console.log("transactionHash:", receipt.transactionHash);
  console.log("gasUsed: ", receipt.gasUsed);
  console.log("eventName:", eventName);
  console.log(event);
  console.log();
}

module.exports = {
  consoleEvents,
};
