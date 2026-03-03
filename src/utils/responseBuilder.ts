export default function buildResponse(primary:any,secondaries:any[]){
    try {
        const emails=[
            primary.email,...secondaries.map(s=>s.email)
        ].filter(Boolean);

        const phones=[
            primary.phoneNumber,
            ...secondaries.map(s=>s.phoneNumber)
        ].filter(Boolean);

        return {
            contact:{
                primaryContactId:primary.id,
                emails:[...new Set(emails)],
                phoneNumbers:[...new Set(phones)],
                secondaryContacts:secondaries.map(s=>s.id)
            }
        }
    } catch (error) {
        throw new Error(String(error));
    }
}