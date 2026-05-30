export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        candidateId: 'ambrogio',
        name: 'Marco Ambrogio',
        percentage: 50,
      },
      {
        candidateId: 'barile',
        name: 'Antonio Barile',
        percentage: 50,
      },
    ]),
  }
}
