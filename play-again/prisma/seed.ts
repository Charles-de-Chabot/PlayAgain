import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import "dotenv/config"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaMariaDb(connectionString)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("🌱 Début du seeding...");

    // --- Création des catégories ---
    const categories = [
        {id: 1, label: "randonnée"},
        {id: 2, label: "neige"},
        {id: 3, label: "running"},
        {id: 4, label: "vélo"},
        {id: 5, label: "escalade"},
        {id: 6, label: "football"},
        {id: 7, label: "basket-ball"},
        {id: 8, label: "natation"},
        {id: 9, label: "fitness"},
        {id: 10, label: "yoga"},
        {id: 11, label: "rugby"},
        {id: 12, label: "volley-ball"},
        {id: 13, label: "golf"},
        {id: 14, label: "tennis"},
        {id: 15, label: "Tennis de table"},
        {id: 16, label: "Arts martiaux"},
        {id: 17, label: "Boxe"},
        {id: 18, label: "Patinage"},
        {id: 19, label: "Surf"},
        {id: 20, label: "Roller"},
        {id: 21, label: "Plongée"},
        {id: 22, label: "Canoë-kayak"},
        {id: 23, label: "Aviron"},
        {id: 24, label: "Voile"},
        {id: 25, label: "handball"},
        {id: 26, label: "hockey"},
        {id: 27, label: "water-polo"},
        {id: 28, label: "crossfit"},
        {id: 29, label: "pilates"},
        {id: 30, label: "dance"},
        {id: 31, label: "Equitation"},
        {id: 32, label: "sports nautiques"},
        {id: 33, label: "Polo"},
        {id: 34, label: "Tir à l'arc"},
        {id: 35, label: "Athlétisme"},
        {id: 36, label: "Sports de raquette"},
        {id: 37, label: "Sports de plein air"},
        {id: 38, label: "Skateboard"},
    ]

    console.log("Insertion des catégories...");
    for(const cat of categories) {
        await prisma.category.upsert({
            where: {id: cat.id},
            update:{ label: cat.label },
            create: cat,
        })
    }

    // --- Création des types (classés par catégorie) ---
    const types = [
        // 1 - Randonnée
        { id: 1, label: "Chaussures de marche", category_id: 1 },
        { id: 2, label: "Sacs à dos", category_id: 1 },
        { id: 3, label: "Bâtons de marche", category_id: 1 },
        { id: 4, label: "Vêtements", category_id: 1 },
        { id: 5, label: "Équipement", category_id: 1 },

        // 2 - Neige
        { id: 6, label: "Skis Alpins", category_id: 2 },
        { id: 7, label: "Snowboards", category_id: 2 },
        { id: 8, label: "Masques de ski", category_id: 2 },
        { id: 9, label: "Vêtements", category_id: 2 },
        { id: 10, label: "Équipement", category_id: 2 },

        // 3 - Running
        { id: 11, label: "Chaussures de running", category_id: 3 },
        { id: 12, label: "Montres GPS", category_id: 3 },
        { id: 13, label: "Vêtements", category_id: 3 },
        { id: 14, label: "Équipement", category_id: 3 },

        // 4 - Vélo
        { id: 15, label: "VTT", category_id: 4 },
        { id: 16, label: "Vélos de route", category_id: 4 },
        { id: 17, label: "Casques", category_id: 4 },
        { id: 18, label: "Vêtements", category_id: 4 },
        { id: 19, label: "Équipement", category_id: 4 },

        // 5 - Escalade
        { id: 20, label: "Baudriers", category_id: 5 },
        { id: 21, label: "Chaussons d'escalade", category_id: 5 },
        { id: 22, label: "Cordes", category_id: 5 },
        { id: 23, label: "Vêtements", category_id: 5 },
        { id: 24, label: "Équipement", category_id: 5 },

        // 6 - Football
        { id: 25, label: "Ballons", category_id: 6 },
        { id: 26, label: "Chaussures à crampons", category_id: 6 },
        { id: 27, label: "Protège-tibias", category_id: 6 },
        { id: 28, label: "Vêtements", category_id: 6 },
        { id: 29, label: "Équipement", category_id: 6 },

        // 7 - Basket-ball
        { id: 30, label: "Ballons de basket", category_id: 7 },
        { id: 31, label: "Chaussures de basket", category_id: 7 },
        { id: 32, label: "Paniers/Arceaux", category_id: 7 },
        { id: 33, label: "Vêtements", category_id: 7 },
        { id: 34, label: "Équipement", category_id: 7 },

        // 8 - Natation
        { id: 35, label: "Maillots de bain", category_id: 8 },
        { id: 36, label: "Lunettes de nage", category_id: 8 },
        { id: 37, label: "Palmes", category_id: 8 },
        { id: 38, label: "Vêtements", category_id: 8 },
        { id: 39, label: "Équipement", category_id: 8 },

        // 9 - Fitness
        { id: 40, label: "Haltères", category_id: 9 },
        { id: 41, label: "Tapis de sol", category_id: 9 },
        { id: 42, label: "Bancs de musculation", category_id: 9 },
        { id: 43, label: "Vêtements", category_id: 9 },
        { id: 44, label: "Équipement", category_id: 9 },

        // 10 - Yoga
        { id: 45, label: "Tapis de yoga", category_id: 10 },
        { id: 46, label: "Briques/Sangles", category_id: 10 },
        { id: 47, label: "Vêtements", category_id: 10 },
        { id: 48, label: "Équipement", category_id: 10 },

        // 11 - Rugby
        { id: 49, label: "Ballons de rugby", category_id: 11 },
        { id: 50, label: "Épaulières", category_id: 11 },
        { id: 51, label: "Vêtements", category_id: 11 },
        { id: 52, label: "Équipement", category_id: 11 },

        // 12 - Volley-ball
        { id: 53, label: "Ballons de volley", category_id: 12 },
        { id: 54, label: "Genouillères", category_id: 12 },
        { id: 55, label: "Vêtements", category_id: 12 },
        { id: 56, label: "Équipement", category_id: 12 },

        // 13 - Golf
        { id: 57, label: "Clubs de golf", category_id: 13 },
        { id: 58, label: "Balles de golf", category_id: 13 },
        { id: 59, label: "Sacs de golf", category_id: 13 },
        { id: 60, label: "Vêtements", category_id: 13 },
        { id: 61, label: "Équipement", category_id: 13 },

        // 14 - Tennis
        { id: 62, label: "Raquettes de tennis", category_id: 14 },
        { id: 63, label: "Balles de tennis", category_id: 14 },
        { id: 64, label: "Vêtements", category_id: 14 },
        { id: 65, label: "Équipement", category_id: 14 },

        // 15 - Tennis de table
        { id: 66, label: "Raquettes de ping-pong", category_id: 15 },
        { id: 67, label: "Balles de ping-pong", category_id: 15 },
        { id: 68, label: "Vêtements", category_id: 15 },
        { id: 69, label: "Équipement", category_id: 15 },

        // 16 - Arts martiaux
        { id: 70, label: "Kimonos", category_id: 16 },
        { id: 71, label: "Protections/Pao", category_id: 16 },
        { id: 72, label: "Vêtements", category_id: 16 },
        { id: 73, label: "Équipement", category_id: 16 },

        // 17 - Boxe
        { id: 74, label: "Gants de boxe", category_id: 17 },
        { id: 75, label: "Sacs de frappe", category_id: 17 },
        { id: 76, label: "Vêtements", category_id: 17 },
        { id: 77, label: "Équipement", category_id: 17 },

        // 18 - Patinage
        { id: 78, label: "Patins à glace", category_id: 18 },
        { id: 79, label: "Protections", category_id: 18 },
        { id: 80, label: "Vêtements", category_id: 18 },
        { id: 81, label: "Équipement", category_id: 18 },

        // 19 - Surf
        { id: 82, label: "Planches de surf", category_id: 19 },
        { id: 83, label: "Combinaisons", category_id: 19 },
        { id: 84, label: "Vêtements", category_id: 19 },
        { id: 85, label: "Équipement", category_id: 19 },

        // 20 - Roller
        { id: 86, label: "Rollers", category_id: 20 },
        { id: 87, label: "Roues de rechange", category_id: 20 },
        { id: 88, label: "Vêtements", category_id: 20 },
        { id: 89, label: "Équipement", category_id: 20 },

        // 21 - Plongée
        { id: 90, label: "Masques/Tubas", category_id: 21 },
        { id: 91, label: "Détendeurs/Stab", category_id: 21 },
        { id: 92, label: "Ordinateurs de plongée", category_id: 21 },
        { id: 93, label: "Vêtements", category_id: 21 },
        { id: 94, label: "Équipement", category_id: 21 },

        // 22 - Canoë-kayak
        { id: 95, label: "Kayaks", category_id: 22 },
        { id: 96, label: "Pagaies", category_id: 22 },
        { id: 97, label: "Vêtements", category_id: 22 },
        { id: 98, label: "Équipement", category_id: 22 },

        // 23 - Aviron
        { id: 99, label: "Rameurs", category_id: 23 },
        { id: 100, label: "Vêtements", category_id: 23 },
        { id: 101, label: "Équipement", category_id: 23 },

        // 24 - Voile
        { id: 102, label: "Bateaux/Dériveurs", category_id: 24 },
        { id: 103, label: "Accastillage", category_id: 24 },
        { id: 104, label: "Vêtements", category_id: 24 },
        { id: 105, label: "Équipement", category_id: 24 },

        // 25 - Handball
        { id: 106, label: "Ballons de hand", category_id: 25 },
        { id: 107, label: "Chaussures indoor", category_id: 25 },
        { id: 108, label: "Vêtements", category_id: 25 },
        { id: 109, label: "Équipement", category_id: 25 },

        // 26 - Hockey
        { id: 110, label: "Crosses", category_id: 26 },
        { id: 111, label: "Patins de hockey", category_id: 26 },
        { id: 112, label: "Vêtements", category_id: 26 },
        { id: 113, label: "Équipement", category_id: 26 },

        // 27 - Water-polo
        { id: 114, label: "Bonnets de polo", category_id: 27 },
        { id: 115, label: "Ballons spécialisés", category_id: 27 },
        { id: 116, label: "Vêtements", category_id: 27 },
        { id: 117, label: "Équipement", category_id: 27 },

        // 28 - Crossfit
        { id: 118, label: "Kettlebells", category_id: 28 },
        { id: 119, label: "Cordes à sauter", category_id: 28 },
        { id: 120, label: "Vêtements", category_id: 28 },
        { id: 121, label: "Équipement", category_id: 28 },

        // 29 - Pilates
        { id: 122, label: "Ballons de pilates", category_id: 29 },
        { id: 123, label: "Anneaux", category_id: 29 },
        { id: 124, label: "Vêtements", category_id: 29 },
        { id: 125, label: "Équipement", category_id: 29 },

        // 30 - Danse
        { id: 126, label: "Chaussons de danse", category_id: 30 },
        { id: 127, label: "Justaucorps", category_id: 30 },
        { id: 128, label: "Vêtements", category_id: 30 },
        { id: 129, label: "Équipement", category_id: 30 },

        // 31 - Equitation
        { id: 130, label: "Selles", category_id: 31 },
        { id: 131, label: "Bombes/Casques", category_id: 31 },
        { id: 132, label: "Bottes d'équitation", category_id: 31 },
        { id: 133, label: "Vêtements", category_id: 31 },
        { id: 134, label: "Équipement", category_id: 31 },

        // 32 - Sports nautiques
        { id: 135, label: "Wakeboards", category_id: 32 },
        { id: 136, label: "Skis nautiques", category_id: 32 },
        { id: 137, label: "Vêtements", category_id: 32 },
        { id: 138, label: "Équipement", category_id: 32 },

        // 33 - Polo
        { id: 139, label: "Maillets", category_id: 33 },
        { id: 140, label: "Vêtements", category_id: 33 },
        { id: 141, label: "Équipement", category_id: 33 },

        // 34 - Tir à l'arc
        { id: 142, label: "Arcs", category_id: 34 },
        { id: 143, label: "Flèches", category_id: 34 },
        { id: 144, label: "Cibles", category_id: 34 },
        { id: 145, label: "Vêtements", category_id: 34 },
        { id: 146, label: "Équipement", category_id: 34 },

        // 35 - Athlétisme
        { id: 147, label: "Chaussures à pointes", category_id: 35 },
        { id: 148, label: "Matériel de saut/lancer", category_id: 35 },
        { id: 149, label: "Vêtements", category_id: 35 },
        { id: 150, label: "Équipement", category_id: 35 },

        // 36 - Sports de raquette (Squash/Padel)
        { id: 151, label: "Raquettes de padel", category_id: 36 },
        { id: 152, label: "Raquettes de squash", category_id: 36 },
        { id: 153, label: "Vêtements", category_id: 36 },
        { id: 154, label: "Équipement", category_id: 36 },

        // 37 - Sports de plein air
        { id: 155, label: "Hamacs", category_id: 37 },
        { id: 156, label: "Matériel de camping", category_id: 37 },
        { id: 157, label: "Vêtements", category_id: 37 },
        { id: 158, label: "Équipement", category_id: 37 },

        // 38 - Skateboard
        { id: 159, label: "Plateaux", category_id: 38 },
        { id: 160, label: "Trucks", category_id: 38 },
        { id: 161, label: "Roues", category_id: 38 },
        { id: 162, label: "Vêtements", category_id: 38 },
        { id: 163, label: "Équipement", category_id: 38 },
    ]

    console.log("Insertion des types...");
    for(const type of types) {
        await prisma.type.upsert({
            where: {id: type.id},
            update: { label: type.label, category_id: type.category_id },
            create: type,
        })
    }

    // --- Création des tailles (Sizes) ---
    console.log("Génération des tailles uniques (vêtements, chaussures, équipements)...");
    
    const textile = ["3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"];
    const chaussures = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"];
    const skis = ["140cm", "150cm", "160cm", "170cm", "180cm", "190cm"];
    const velos = ["48", "50", "52", "54", "56", "58", "60", "62"];
    const tennis = ["L0", "L1", "L2", "L3", "L4", "L5"];
    const ballons = ["T3", "T4", "T5", "T6", "T7"];
    const poids = ["2kg", "5kg", "10kg", "15kg", "20kg"];
    const boxe = ["8oz", "10oz", "12oz", "14oz", "16oz"];
    const planches = ["6'0\"", "7'0\"", "8'0\"", "7.5\"", "8.0\"", "8.5\""];
    const tirALarc = ["26\"", "28\"", "30\""];
    const volume = ["20L", "30L", "40L", "60L"];

    // 1. Création de toutes les tailles uniques dans la table Size
    const toutesLesTailles = [...new Set([
        ...textile, ...chaussures, ...skis, ...velos, ...tennis, 
        ...ballons, ...poids, ...boxe, ...planches, ...tirALarc, ...volume
    ])];

    for (const label of toutesLesTailles) {
        await prisma.size.upsert({
            where: { label },
            update: {},
            create: { label }
        });
    }

    // 2. Connexion des tailles aux catégories
    console.log("Association des tailles aux catégories...");
    for (let i = 1; i <= 38; i++) {
        // Toutes les catégories ont textile + chaussures
        await prisma.category.update({
            where: { id: i },
            data: {
                sizes: { connect: [...textile, ...chaussures].map(label => ({ label })) }
            }
        });

        // Connexions spécifiques
        if ([1, 5, 13, 37].includes(i)) { // Rando, Escalade, Golf, Plein air
            await prisma.category.update({
                where: { id: i },
                data: { sizes: { connect: volume.map(label => ({ label })) } }
            });
        }
        if (i === 2) { // Neige
            await prisma.category.update({
                where: { id: 2 },
                data: { sizes: { connect: skis.map(label => ({ label })) } }
            });
        }
        if (i === 4) { // Vélo
            await prisma.category.update({
                where: { id: 4 },
                data: { sizes: { connect: velos.map(label => ({ label })) } }
            });
        }
        if ([6, 7, 11, 12, 25, 27].includes(i)) { // Sports de ballons
            await prisma.category.update({
                where: { id: i },
                data: { sizes: { connect: ballons.map(label => ({ label })) } }
            });
        }
        if ([9, 28, 29].includes(i)) { // Fitness, Crossfit, Pilates
            await prisma.category.update({
                where: { id: i },
                data: { sizes: { connect: poids.map(label => ({ label })) } }
            });
        }
        if (i === 17) { // Boxe
            await prisma.category.update({
                where: { id: 17 },
                data: { sizes: { connect: boxe.map(label => ({ label })) } }
            });
        }
        if ([19, 32, 38].includes(i)) { // Surf, Nautique, Skate
            await prisma.category.update({
                where: { id: i },
                data: { sizes: { connect: planches.map(label => ({ label })) } }
            });
        }
        if (i === 34) { // Tir à l'arc
            await prisma.category.update({
                where: { id: 34 },
                data: { sizes: { connect: tirALarc.map(label => ({ label })) } }
            });
        }
        if (i === 14 || i === 36) { // Tennis & Raquettes
            await prisma.category.update({
                where: { id: i },
                data: { sizes: { connect: tennis.map(label => ({ label })) } }
            });
        }
    }

    // --- Création des marques ---
    const marques = [
        {id: 1, label: "Salomon"},
        {id: 2, label: "Columbia"},
        {id: 3, label: "The North Face"},
        {id: 4, label: "Merrell"},
        {id: 5, label: "Forclaz"},
        {id: 6, label: "Decathlon"},
        {id: 7, label: "Rossignol"},
        {id: 8, label: "Burton"},
        {id: 9, label: "Head"},
        {id: 10, label: "Atomic"},
        {id: 11, label: "Petzl"},
        {id: 12, label: "Black Diamond"},
        {id: 13, label: "La Sportiva"},
        {id: 14, label: "Mammut"},
        {id: 15, label: "Millet"},
        {id: 16, label: "Patagonia"},
        {id: 17, label: "Jack Wolfskin"},
        {id: 18, label: "Arc'teryx"},
        {id: 19, label: "Helly Hansen"},
        {id: 20, label: "Nike"},
        {id: 21, label: "Asics"},
        {id: 22, label: "Adidas"},
        {id: 23, label: "Brooks"},
        {id: 24, label: "Hoka"},
        {id: 25, label: "New Balance"},
        {id: 26, label: "Saucony"},
        {id: 27, label: "Puma"},
        {id: 28, label: "Specialized"},
        {id: 29, label: "Trek"},
        {id: 30, label: "Scott"},
        {id: 31, label: "Giant"},
        {id: 32, label: "Canyon"},
        {id: 33, label: "Shimano"},
        {id: 34, label: "Under Armour"},
        {id: 35, label: "MyProtein"},
        {id: 36, label: "Lululemon"},
        {id: 37, label: "Alo Yoga"},
        {id: 38, label: "Manduka"},
        {id: 39, label: "Prana"},
        {id: 40, label: "Gorilla Wear"},
        {id: 41, label: "Gymshark"},
        {id: 42, label: "Nobull"},
        {id: 43, label: "Rogue Fitness"},
        {id: 44, label: "Sissel"},
        {id: 45, label: "Gratz"},
        {id: 46, label: "Balanced Body"},
        {id: 47, label: "Umbro"},
        {id: 48, label: "Kipsta"},
        {id: 49, label: "Spalding"},
        {id: 50, label: "Wilson"},
        {id: 51, label: "Canterbury"},
        {id: 52, label: "Gilbert"},
        {id: 53, label: "Macron"},
        {id: 54, label: "Le Coq Sportif"},
        {id: 55, label: "Mikasa"},
        {id: 56, label: "Mizuno"},
        {id: 57, label: "Kempa"},
        {id: 58, label: "Hummel"},
        {id: 59, label: "Select"},
        {id: 60, label: "Bauer"},
        {id: 61, label: "CCM"},
        {id: 62, label: "Warrior"},
        {id: 63, label: "Grays"},
        {id: 64, label: "Ritual"},
        {id: 65, label: "Babolat"},
        {id: 66, label: "Yonex"},
        {id: 67, label: "Lacoste"},
        {id: 68, label: "Butterfly"},
        {id: 69, label: "Cornilleau"},
        {id: 70, label: "Stiga"},
        {id: 71, label: "Joola"},
        {id: 72, label: "Technifibre"},
        {id: 73, label: "Bullpadel"},
        {id: 74, label: "Kuikma"}, 
        {id: 75, label: "Venum"},
        {id: 76, label: "Hayabusa"},
        {id: 77, label: "Everlast"},
        {id: 78, label: "Title"},
        {id: 79, label: "Cleto Reyes"},
        {id: 80, label: "Hoyt"},
        {id: 81, label: "Mathews"},
        {id: 82, label: "Easton"},
        {id: 83, label: "Win&Win"},
        {id: 84, label: "Speedo"},
        {id: 85, label: "Arena"},
        {id: 86, label: "TYR"},
        {id: 87, label: "Nabaiji"},
        {id: 88, label: "Quiksilver"},
        {id: 89, label: "Roxy"},
        {id: 90, label: "Billabong"},
        {id: 91, label: "O'Neill"},
        {id: 92, label: "Rip Curl"},
        {id: 93, label: "Mares"},
        {id: 94, label: "Cressi"},
        {id: 95, label: "Scubapro"},
        {id: 96, label: "Aqualung"},
        {id: 97, label: "Itiwit"},
        {id: 98, label: "Pyranha"},
        {id: 99, label: "Perception"},
        {id: 100, label: "Tahe"},
        {id: 101, label: "Musto"},
        {id: 102, label: "Tribord"},
        {id: 103, label: "Gill"},
        {id: 104, label: "Jobe"},
        {id: 105, label: "O'Brien"},
        {id: 106, label: "Yamaha"},
        {id: 107, label: "Edea"},
        {id: 108, label: "Risport"},
        {id: 109, label: "Riedell"},
        {id: 110, label: "Rollerblade"},
        {id: 111, label: "Powerslide"},
        {id: 112, label: "Roces"},
        {id: 113, label: "Repetto"},
        {id: 114, label: "Bloch"},
        {id: 115, label: "Capezio"},
        {id: 116, label: "Sansha"},
        {id: 117, label: "Hermes"},
        {id: 118, label: "Antarès"},
        {id: 119, label: "Pikeur"},
        {id: 120, label: "Horse Pilot"},
        {id: 121, label: "La Martina"},
        {id: 122, label: "U.S. Polo Assn"},
        {id: 123, label: "Cassablanca"},
        {id: 124, label: "Vans"},
        {id: 125, label: "Santa Cruz"},
        {id: 126, label: "Element"},
        {id: 127, label: "DC Shoes"},
        {id: 128, label: "Girl"},
        {id: 129, label: "Leki"},
        {id: 130, label: "Osprey"},
        {id: 131, label: "Deuter"},
        {id: 132, label: "Komperdell"},
        {id: 133, label: "Oakley"},
        {id: 134, label: "Smith"},
        {id: 135, label: "Fischer"},
        {id: 136, label: "K2"},
        {id: 137, label: "Union"},
        {id: 138, label: "Beal"},
        {id: 139, label: "Edelrid"},
        {id: 140, label: "Grivel"},
        {id: 141, label: "Camp"},
        {id: 142, label: "Garmin"},
        {id: 143, label: "Polar"},
        {id: 144, label: "Camelbak"},
        {id: 145, label: "Coros"},
        {id: 146, label: "Pinarello"},
        {id: 147, label: "Look"},
        {id: 148, label: "Giro"},
        {id: 149, label: "Campagnolo"},
        {id: 150, label: "Continental"},
        {id: 151, label: "Technogym"},
        {id: 152, label: "Life Fitness"},
        {id: 153, label: "Eleiko"},
        {id: 154, label: "Concept2"},
        {id: 155, label: "Assault Fitness"},
        {id: 156, label: "Xenios"},
        {id: 157, label: "Molten"},
        {id: 158, label: "Goalrilla"},
        {id: 159, label: "SKLZ"},
        {id: 160, label: "Rhino"},
        {id: 161, label: "Steeden"},
        {id: 162, label: "Senoh"},
        {id: 163, label: "True"},
        {id: 164, label: "STX"},
        {id: 165, label: "Malmsten"},
        {id: 166, label: "Turbo"},
        {id: 167, label: "Luxilon"},
        {id: 168, label: "Lobster"},
        {id: 169, label: "Donic"},
        {id: 170, label: "Tibhar"},
        {id: 171, label: "DHS"},
        {id: 172, label: "Nox"},
        {id: 173, label: "StarVie"},
        {id: 174, label: "Ashaway"},
        {id: 175, label: "Meiji"},
        {id: 176, label: "Century"},
        {id: 177, label: "Tatami"},
        {id: 178, label: "Ringside"},
        {id: 179, label: "Fairtex"},
        {id: 180, label: "Rival"},
        {id: 181, label: "Beiter"},
        {id: 182, label: "Shibuya"},
        {id: 183, label: "FINIS"},
        {id: 184, label: "FCS"},
        {id: 185, label: "Dakine"},
        {id: 186, label: "Firewire"},
        {id: 187, label: "Suunto"},
        {id: 188, label: "Apeks"},
        {id: 189, label: "Tusa"},
        {id: 190, label: "Werner"},
        {id: 191, label: "Palm"},
        {id: 192, label: "Hiko"},
        {id: 193, label: "Harken"},
        {id: 194, label: "Ronstan"},
        {id: 195, label: "North Sails"},
        {id: 196, label: "Liquid Force"},
        {id: 197, label: "Hyperlite"},
        {id: 198, label: "Ronix"},
        {id: 199, label: "Bont"},
        {id: 200, label: "Seba"},
        {id: 201, label: "Bones"},
        {id: 202, label: "Stubben"},
        {id: 203, label: "Prestige"},
        {id: 204, label: "Freejump"},
        {id: 205, label: "Nano"},
        {id: 206, label: "Stephen's"},
        {id: 207, label: "Mondo"},
        {id: 208, label: "Gill Athletics"},
        {id: 209, label: "Nordic Sport"},
        {id: 210, label: "Independent"},
        {id: 211, label: "Spitfire"},
        {id: 212, label: "Powell-Peralta"},
        {id: 213, label: "Marty Sports"},
        {id: 214, label: "Dima Sport"},
        {id: 215, label: "SRAM"},
        {id: 216, label: "Wahoo"},
        {id: 217, label: "Zipp"},
        {id: 218, label: "Rhino Rugby"},
        {id: 219, label: "Bowtech"},
        {id: 220, label: "PSE Archery"},
        {id: 221, label: "Sex Wax"},
        {id: 222, label: "Nelo"},
        {id: 223, label: "Tatami Fightwear"},
        {id: 224, label: "CWD"},
        {id: 225, label: "Theragun"},
    ]

    console.log("Insertion des marques...");
    for(const marque of marques) {
        await prisma.brand.upsert({
            where: {id: marque.id},
            update:{ label: marque.label },
            create: marque,
        })
    }

    console.log("✅ Seeding terminé !");
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })