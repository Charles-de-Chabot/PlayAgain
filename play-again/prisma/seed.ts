import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import "dotenv/config"
import bcrypt from "bcryptjs"
import * as fs from "fs"
import * as path from "path"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaMariaDb(connectionString)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("🌱 Début du seeding...");

    // --- Création des catégories ---
    const categories = [
        {id: 1, label: "randonnée"},
        {id: 2, label: "sports d'hiver"},
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

        // 2 - Sports d'hiver
        { id: 6, label: "Skis Alpins", category_id: 2 },
        { id: 7, label: "Snowboards", category_id: 2 },
        { id: 8, label: "Masques de ski", category_id: 2 },
        { id: 9, label: "Vêtements", category_id: 2 },
        { id: 10, label: "Équipement", category_id: 2 },
        { id: 164, label: "Chaussures de ski", category_id: 2 },
        { id: 165, label: "Chaussures", category_id: 2 },
        { id: 166, label: "Gants", category_id: 2 },
        { id: 167, label: "Raquettes", category_id: 2 },

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

    // 2. Connexion des tailles aux types de produits
    console.log("Association des tailles aux types de produits...");
    
    // Récupération de tous les types pour l'association
    const allTypes = await prisma.type.findMany();

    for (const type of allTypes) {
        let sizesToConnect: string[] = [];

        // Logique d'association par mots-clés
        const label = type.label.toLowerCase();

        if (label.includes("vêtements") || label.includes("gants") || label.includes("maillot") || label.includes("short") || label.includes("baudrier")) {
            sizesToConnect = [...textile];
        } else if (label.includes("chaussures") || label.includes("pointes") || label.includes("chaussons") || label.includes("bottes")) {
            sizesToConnect = [...chaussures];
        } else if (label.includes("ski") || label.includes("snowboard") || label.includes("raquette")) {
            sizesToConnect = [...skis];
        } else if (label.includes("vtt") || label.includes("vélo")) {
            sizesToConnect = [...velos];
        } else if (label.includes("raquette") && (type.category_id === 14 || type.category_id === 36)) {
            sizesToConnect = [...tennis];
        } else if (label.includes("ballon") || label.includes("boule")) {
            sizesToConnect = [...ballons];
        } else if (label.includes("poids") || label.includes("haltère")) {
            sizesToConnect = [...poids];
        } else if (label.includes("gant") && type.category_id === 17) {
            sizesToConnect = [...boxe];
        } else if (label.includes("planche") || label.includes("plateau") || label.includes("surf")) {
            sizesToConnect = [...planches];
        } else if (label.includes("arc")) {
            sizesToConnect = [...tirALarc];
        } else if (label.includes("sac") || label.includes("volume")) {
            sizesToConnect = [...volume];
        }

        // Si des tailles ont été identifiées, on les connecte
        if (sizesToConnect.length > 0) {
            await prisma.type.update({
                where: { id: type.id },
                data: {
                    sizes: {
                        connect: sizesToConnect.map(l => ({ label: l }))
                    }
                }
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

    // Listes de classification pour le peuplement propre
    const premiumLabels = [
        "Arc'teryx", "Patagonia", "Lululemon", "Alo Yoga", "Gratz", "Balanced Body",
        "Lacoste", "Hermes", "Antarès", "Horse Pilot", "La Martina", "Cassablanca",
        "Stubben", "Prestige", "Stephen's", "CWD", "Pinarello", "Eleiko", "Technogym", "Specialized"
    ].map(l => l.toUpperCase());

    const technicalLabels = [
        "Salomon", "Columbia", "The North Face", "Merrell", "Rossignol", "Burton", "Head",
        "Atomic", "Petzl", "Black Diamond", "La Sportiva", "Mammut", "Millet", "Helly Hansen",
        "Nike", "Asics", "Adidas", "Brooks", "Hoka", "New Balance", "Saucony", "Trek",
        "Scott", "Giant", "Canyon", "Shimano", "Under Armour", "Manduka", "Prana", "Gymshark",
        "Nobull", "Rogue Fitness", "Spalding", "Wilson", "Canterbury", "Gilbert", "Mikasa",
        "Mizuno", "Kempa", "Hummel", "Select", "Bauer", "CCM", "Warrior", "Grays", "Ritual",
        "Babolat", "Yonex", "Butterfly", "Cornilleau", "Stiga", "Joola", "Technifibre", "Bullpadel",
        "Venum", "Hayabusa", "Everlast", "Title", "Cleto Reyes", "Hoyt", "Mathews", "Easton",
        "Win&Win", "Speedo", "Arena", "TYR", "Quiksilver", "Roxy", "Billabong", "O'Neill",
        "Rip Curl", "Mares", "Cressi", "Scubapro", "Aqualung", "Pyranha", "Perception", "Tahe",
        "Musto", "Gill", "Jobe", "O'Brien", "Yamaha", "Edea", "Risport", "Riedell", "Rollerblade",
        "Powerslide", "Roces", "Repetto", "Bloch", "Capezio", "Sansha", "Pikeur", "Santa Cruz",
        "Element", "Leki", "Osprey", "Deuter", "Komperdell", "Oakley", "Smith", "Fischer", "K2",
        "Union", "Beal", "Edelrid", "Grivel", "Camp", "Garmin", "Polar", "Camelbak", "Coros",
        "Look", "Giro", "Campagnolo", "Continental", "Life Fitness", "Concept2", "Assault Fitness",
        "Xenios", "Molten", "Goalrilla", "SKLZ", "Steeden", "Senoh", "STX", "Malmsten", "Turbo",
        "Luxilon", "Lobster", "Donic", "Tibhar", "DHS", "Nox", "StarVie", "Ashaway", "Beiter",
        "Shibuya", "FINIS", "FCS", "Dakine", "Firewire", "Suunto", "Apeks", "Tusa", "Werner",
        "Palm", "Hiko", "Harken", "Ronstan", "North Sails", "Liquid Force", "Hyperlite", "Ronix",
        "Bont", "Seba", "Bones", "Freejump", "Gill Athletics", "Nordic Sport", "Independent",
        "Spitfire", "Powell-Peralta", "SRAM", "Wahoo", "Zipp", "Bowtech", "PSE Archery", "Nelo",
        "Tatami Fightwear", "Theragun"
    ].map(l => l.toUpperCase());

    console.log("Enrichissement des positions de marché des marques...");
    const enrichedMarques = marques.map(m => {
        const labelUpper = m.label.toUpperCase();
        let marketPosition: "GENERALIST" | "TECHNICAL" | "PREMIUM" = "GENERALIST";

        if (premiumLabels.includes(labelUpper)) {
            marketPosition = "PREMIUM";
        } else if (technicalLabels.includes(labelUpper)) {
            marketPosition = "TECHNICAL";
        }

        return {
            ...m,
            marketPosition
        };
    });

    console.log("Insertion des marques...");
    for(const marque of enrichedMarques) {
        await prisma.brand.upsert({
            where: {id: marque.id},
            update:{ label: marque.label, marketPosition: marque.marketPosition },
            create: marque,
        })
    }

    // --- Insertion des Utilisateurs ---
    console.log("Création des utilisateurs de test...");
    const hashedPassword = await bcrypt.hash("test", 10);
    const usersToCreate = [
        { username: "test", email: "test@test.com", password: hashedPassword },
        { username: "test2", email: "test2@test.com", password: hashedPassword },
        { username: "test3", email: "test3@test.com", password: hashedPassword },
    ];

    const dbUsers: Record<string, any> = {};
    for (const u of usersToCreate) {
        dbUsers[u.email] = await prisma.user.upsert({
            where: { email: u.email },
            update: { username: u.username, password: u.password, stripeConnectId: null },
            create: {
                username: u.username,
                email: u.email,
                password: u.password,
                is_active: true,
                role: "USER",
                stripeConnectId: null
            }
        });
    }

    // --- Insertion des Produits de Test avec Photos ---
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.basketItem.deleteMany({});
    await prisma.favItem.deleteMany({});
    await prisma.media.deleteMany({});
    await prisma.product.deleteMany({});

    const productsData = [
        {
            userEmail: "test@test.com",
            category_id: 2,
            type_id: 164,
            brand_id: 1,
            title: "Chaussures de Ski Salomon S/Pro 100",
            description: "Chaussures de ski alpin confortables et précises, flex de 100, idéales pour skieurs intermédiaires sur tout type de neige.",
            price: 180.00,
            age: 2023,
            accessory_included: true,
            targetGender: "MAN",
            levelCategory: "INTERMEDIATE",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/1_1778586044615_chaussuresSkiTest.jpg",
                "/uploads/products/1_1778586044607_chaussuresSkiTest2.jpg"
            ]
        },
        {
            userEmail: "test2@test.com",
            category_id: 2,
            type_id: 164,
            brand_id: 10,
            title: "Chaussures de Ski Femme Atomic Hawx Prime 95 W",
            description: "Chaussures haut de gamme légères et thermoformables pour un contrôle exceptionnel et un confort optimal.",
            price: 220.00,
            age: 2024,
            accessory_included: false,
            targetGender: "WOMAN",
            levelCategory: "ADVANCED",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/16_1779284792436_chaussureski2.webp",
                "/uploads/products/16_1779284792443_chaussureski2.1.webp"
            ]
        },
        {
            userEmail: "test3@test.comp",
            category_id: 2,
            type_id: 164,
            brand_id: 7,
            title: "Chaussures de Ski Enfant Rossignol Hero J4",
            description: "Idéales pour l'apprentissage du ski. Quatre crochets pour un excellent maintien et une transmission d'appuis progressive.",
            price: 85.00,
            age: 2022,
            accessory_included: false,
            targetGender: "KIDS",
            levelCategory: "BEGINNER",
            state: "BON",
            imageUrls: [
                "/uploads/products/17_1779285022767_chaussureski3.webp",
                "/uploads/products/17_1779285022778_chaussureski3.1.webp",
                "/uploads/products/18_1779286688980_chaussureski3.webp",
                "/uploads/products/18_1779286688985_chaussureski3.1.webp"
            ]
        },
        {
            userEmail: "test@test.com",
            category_id: 2,
            type_id: 166,
            brand_id: 19,
            title: "Gants de Ski Helly Hansen Swift HT",
            description: "Gants chauds, imperméables et respirants avec membrane Helly Tech. Parfaits pour garder les mains au sec.",
            price: 35.00,
            age: 2024,
            accessory_included: false,
            targetGender: "UNISEX",
            levelCategory: "INTERMEDIATE",
            state: "NEUF",
            imageUrls: [
                "/uploads/products/3_1778589275958_gantsSkiTest.webp",
                "/uploads/products/3_1778589275965_gantsSkiTest2.webp"
            ]
        },
        {
            userEmail: "test2@test.com",
            category_id: 2,
            type_id: 9,
            brand_id: 18,
            title: "Veste de Ski Arc'teryx Sabre SV Gore-Tex",
            description: "Veste de protection ultime en Gore-Tex Pro triple épaisseur, imperméable et coupe-vent, conçue pour le freeride et les conditions extrêmes.",
            price: 320.00,
            age: 2023,
            accessory_included: true,
            targetGender: "MAN",
            levelCategory: "ADVANCED",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/2_1778588911416_vesteSkiTest.webp",
                "/uploads/products/2_1778588911407_vestSkiTest2.webp",
                "/uploads/products/2_1778588911423_vesteSkiTest3.webp"
            ]
        },
        {
            userEmail: "test@test.com",
            category_id: 24,
            type_id: 102,
            brand_id: 102,
            title: "Dériveur Tribord 5S Gonflable",
            description: "Dériveur compact et ultra-stable pour s'initier à la voile en famille. Facile à transporter et à gréer en 20 minutes.",
            price: 1200.00,
            age: 2022,
            accessory_included: true,
            targetGender: "UNISEX",
            levelCategory: "BEGINNER",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/5_1778590100065_deriveurTest.webp",
                "/uploads/products/5_1778590100070_deriveurTest2.webp"
            ]
        },
        {
            userEmail: "test3@test.comp",
            category_id: 24,
            type_id: 105,
            brand_id: 195,
            title: "Voile de Spinnaker Asymétrique North Sails",
            description: "Spi de portant haute performance, tissu nylon ultra-léger et résistant, coupe tri-radiale pour une vitesse optimale.",
            price: 450.00,
            age: 2021,
            accessory_included: true,
            targetGender: "UNISEX",
            levelCategory: "PRO",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/4_1778589845235_SpiTest1.jpg",
                "/uploads/products/4_1778589845240_SpiTest2.jpg"
            ]
        },
        {
            userEmail: "test@test.com",
            category_id: 4,
            type_id: 15,
            brand_id: 28,
            title: "VTT Specialized Rockhopper Elite 29\"",
            description: "Cadre aluminium léger, fourche à air RockShox Judy, transmission Shimano 1x11 vitesses, freins à disque hydrauliques. Prêt pour les sentiers.",
            price: 850.00,
            age: 2023,
            accessory_included: true,
            targetGender: "UNISEX",
            levelCategory: "INTERMEDIATE",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/7_1778676167725_veloTest.jpg",
                "/uploads/products/7_1778676167731_veloTest2.jpg"
            ]
        },
        {
            userEmail: "test@test.com",
            category_id: 31,
            type_id: 133,
            brand_id: 120,
            title: "Veste de Concours Horse Pilot Aerotech",
            description: "Veste de concours haut de gamme, respirante et stretch. Conçue pour offrir une liberté de mouvement totale en selle.",
            price: 180.00,
            age: 2023,
            accessory_included: false,
            targetGender: "WOMAN",
            levelCategory: "ADVANCED",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/8_1779194008935_vestequitation1.webp",
                "/uploads/products/8_1779194008941_vestequitation1.1.webp",
                "/uploads/products/8_1779194008945_vestequitation1.2.webp"
            ]
        },
        {
            userEmail: "test2@test.com",
            category_id: 31,
            type_id: 133,
            brand_id: 119,
            title: "Veste Pikeur Askan Softshell",
            description: "Veste élégante en tissu softshell technique, hydrofuge et respirante pour les concours d'équitation.",
            price: 160.00,
            age: 2022,
            accessory_included: false,
            targetGender: "MAN",
            levelCategory: "ADVANCED",
            state: "BON",
            imageUrls: [
                "/uploads/products/9_1779194231037_vestequitation2.webp",
                "/uploads/products/9_1779194231042_vestequitation2.1.webp",
                "/uploads/products/9_1779194231047_vestequitation2.2.webp"
            ]
        },
        {
            userEmail: "test2@test.com",
            category_id: 31,
            type_id: 133,
            brand_id: 48,
            title: "Veste de Concours Fouganza Enfant",
            description: "Veste de concours classique et confortable pour jeune cavalier. Facile d'entretien et très souple.",
            price: 40.00,
            age: 2024,
            accessory_included: false,
            targetGender: "KIDS",
            levelCategory: "BEGINNER",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/10_1779194447648_vestequitation3.avif",
                "/uploads/products/10_1779194447653_vestequitation3.1.avif",
                "/uploads/products/10_1779194447660_vestequitation3.2.avif"
            ]
        },
        {
            userEmail: "test2@test.com",
            category_id: 31,
            type_id: 133,
            brand_id: 118,
            title: "Veste de Concours Antarès Sellier",
            description: "Coupe cintrée ultra-élégante, détails en cuir véritable de la marque d'excellence Antarès Sellier.",
            price: 240.00,
            age: 2023,
            accessory_included: true,
            targetGender: "WOMAN",
            levelCategory: "ADVANCED",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/12_1779262693098_vestequitation4.webpwebp",
                "/uploads/products/12_1779262693108_vestequitation4.1.webp",
                "/uploads/products/12_1779262693119_vestequitation4.2.webp"
            ]
        },
        {
            userEmail: "test3@test.comp",
            category_id: 31,
            type_id: 133,
            brand_id: 120,
            title: "Veste de Pluie d'Équitation Horse Pilot",
            description: "Protection imperméable totale pour monter à cheval par tous les temps. Coutures thermo-soudées.",
            price: 140.00,
            age: 2024,
            accessory_included: false,
            targetGender: "UNISEX",
            levelCategory: "INTERMEDIATE",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/13_1779263026156_vestequitation5.webp",
                "/uploads/products/13_1779263026163_vestequitation5.1.webp",
                "/uploads/products/13_1779263026168_vestequitation5.2.webp"
            ]
        },
        {
            userEmail: "test3@test.comp",
            category_id: 31,
            type_id: 133,
            brand_id: 224,
            title: "Veste de Concours CWD Prestige",
            description: "Création exclusive en collaboration avec CWD, alliant technicité sportive et design de haute couture équestre.",
            price: 220.00,
            age: 2023,
            accessory_included: true,
            targetGender: "WOMAN",
            levelCategory: "ADVANCED",
            state: "EXCELLENT",
            imageUrls: [
                "/uploads/products/14_1779263289858_vestequitation6.jpg",
                "/uploads/products/14_1779263289862_vestequitation6.1.jpg",
                "/uploads/products/14_1779263289867_vesequitation6.2.jpg"
            ]
        },
        {
            userEmail: "test3@test.comp",
            category_id: 31,
            type_id: 133,
            brand_id: 119,
            title: "Veste de Concours Pikeur Skarlett",
            description: "Veste de concours cintrée avec deux fentes arrière et poches à fermeture éclair. Style intemporel.",
            price: 150.00,
            age: 2022,
            accessory_included: false,
            targetGender: "WOMAN",
            levelCategory: "INTERMEDIATE",
            state: "BON",
            imageUrls: [
                "/uploads/products/15_1779267266106_vestequitation7.webp"
            ]
        }
    ];

    console.log("Insertion des articles de test...");
    for (const p of productsData) {
        const user = dbUsers[p.userEmail];
        if (!user) continue;

        const imageUrls = p.imageUrls;

        // Trouver la première pointure ou taille associée à ce type pour ne pas avoir d'erreur SQL de contrainte
        const typeWithSizes = await prisma.type.findUnique({
            where: { id: p.type_id },
            include: { sizes: true }
        });
        const sizeId = typeWithSizes?.sizes?.[0]?.id || null;

        const createdProduct = await prisma.product.create({
            data: {
                title: p.title,
                description: p.description,
                category_id: p.category_id,
                type_id: p.type_id,
                brand_id: p.brand_id,
                state: p.state as any,
                size_id: sizeId,
                price: p.price,
                stock_quantity: 1,
                user_id: user.id,
                age: p.age,
                accessory_included: p.accessory_included,
                is_shipping: true,
                targetGender: p.targetGender as any,
                levelCategory: p.levelCategory as any,
            }
        });

        if (imageUrls.length > 0) {
            await prisma.media.createMany({
                data: imageUrls.map(url => ({
                    url,
                    product_id: createdProduct.id
                }))
            });
        }
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