const body = {
  _studentName: "Test Bot",
  _studentEmail: "test.bot@example.com",
  _category: "Testing",
  _title: "Queue complaint",
  _message: "Hindi ako makapasok sa gymmate, lagi akong nasa queue",
};

async function main() {
  const response = await fetch("http://localhost:5000/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch((error) => {
  console.error("Error posting feedback:", error);
  process.exit(1);
});
