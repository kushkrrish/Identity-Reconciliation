import prisma from "../db";
import buildResponse from "../utils/responseBuilder";
export async function identifyContact(email: string | null, phoneNumber: string | null) {
    try {
        // find out match contacts
        const matchedContacts = await prisma.Contact.findMany({
            where: {
                deletedAt: null,
                OR: [
                    email ? { email } : undefined,
                    phoneNumber ? { phoneNumber } : undefined,

                ].filter(Boolean)
            }
        });
        // if zezo match contacts create newContact
        if (matchedContacts.length === 0) {
            const newContact = await prisma.Contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: 'primary',
                    linkedId: null
                }
            });
            return buildResponse(newContact, []);
        }
        //create
        const primaryIds = new Set<number>();

        for (const contact of matchedContacts) {
            if (contact.linkPrecedence === 'primary') {
                primaryIds.add(contact.id);
            } else {
                primaryIds.add(contact.linkedId);
            }
        }

        // fetch all primary contacts

        const primaryContacts = await prisma.Contact.findMany({
            where: {
                id: { in: [...primaryIds] }
            }
        });
        // if multiple primary 
        // then oldest createdAt wins
        primaryContacts.sort((a, b) => {
            a.createdAt.getTime() - b.createdAt.getTime();
        });
        const truePrimary = primaryContacts[0];
        const otherPrimaries = primaryContacts.slice(1);

        if (otherPrimaries.length > 0) {
            for (let op of otherPrimaries) {
                await prisma.Contact.updateMany({
                    where: {
                        OR: [
                            { id: op.id },
                            { linkedId: op.id }
                        ]
                    },
                    data: {
                        linkedId: truePrimary.id,
                        linkPrecedence: 'secondary',
                        updatedAt: new Date(),
                    }
                });
            }
        }
        // fetch all secondaries
        const allSecondaries = await prisma.Contact.findMany({
            where: {
                linkedId: truePrimary.id,
                deletedAt: null
            }
        });

        const allContacts = [truePrimary, ...allSecondaries];

        // if we get new email or number we have to create new info
        const existingEmail = new Set<string>();
        const mail = allContacts.map(c => c.email).filter(Boolean);
        for (const e of mail) {
            existingEmail.add(e);
        }

        const existingPhone = new Set<string>();
        const phone = allContacts.map(c => c.email).filter(Boolean);
        for (const ph of phone) {
            existingPhone.add(ph);
        }
        const isEmail = email && !existingEmail.has(email);
        const isPhn = phoneNumber && !existingPhone.has(phoneNumber);

        if (isEmail || isPhn) {
            const newSecondary = await prisma.Contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkedId: truePrimary.id,
                    linkPrecedence: 'secondary'
                }
            });
            allSecondaries.push(newSecondary);
        }
        return buildResponse(truePrimary, allSecondaries);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}