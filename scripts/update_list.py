import re
import json

filepath = ".agent/content/shopping_list.md"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to isolate products: "### ✅ Produit X — Title" ... next product or ---
parts = re.split(r'(### [✅🔍] Produit \d+ ?[—-].*?\n)', content)

products = []
for i in range(1, len(parts), 2):
    header_line = parts[i]
    body = parts[i+1]
    match = re.search(r'### ([✅🔍]) Produit (\d+) ?[—-]\s*(.*)', header_line)
    if not match: continue
    status_icon, pid, title = match.groups()
    pid = int(pid)
    attrs = {}
    for line in body.split("\n"):
        line = line.strip()
        if not line: continue
        if line.startswith("- **"):
            m = re.match(r'- \*\*([^**]+)\*\*\s*:\s*(.*)', line)
            if m:
                k, v = m.groups()
                attrs[k] = v
    products.append({
        'id': pid,
        'icon': status_icon,
        'title': title,
        'attrs': attrs
    })

# New products from subagent
new_data = [
    {
        "title": "Libéron Décireur pour meubles et objets (500ml)",
        "marque": "Libéron",
        "cat": "Savons & Nettoyants",
        "gamme": "`💎 PREMIUM`",
        "asin": "B00EV7MCO0",
        "prix": "19,90€",
        "lien": "https://www.amazon.fr/dp/B00EV7MCO0",
        "desc": "Nettoyant solvanté indispensable pour éliminer les anciennes couches de cires et les saletés incrustées sans altérer la patine.",
        "pourquoi": "Élimine les résidus sans soulever les fibres du bois. Préparation parfaite avant une nouvelle finition.",
        "conseil": "Utilisez-le avec de la laine d'acier n°0 pour désincruster les moulures sans rayer le bois."
    },
    {
        "title": "Blanchon Décapant Dégraissant Parquet (1L)",
        "marque": "Blanchon",
        "cat": "Savons & Nettoyants",
        "gamme": "`👑 EXPERT`",
        "asin": "B0056FYJ42",
        "prix": "21,42€",
        "lien": "https://www.amazon.fr/dp/B0056FYJ42",
        "desc": "Formule concentrée suractivée pour un nettoyage intensif des bois encrassés ou gras.",
        "pourquoi": "Élimine les taches rebelles et les résidus de produits d'entretien accumulés. Haute efficacité.",
        "conseil": "Idéal pour remettre à blanc une surface avant une rénovation légère ou un nouveau vernis."
    },
    {
        "title": "Starwax Fabulous Savon de Marseille en Copeaux (750g)",
        "marque": "Starwax",
        "cat": "Savons & Nettoyants",
        "gamme": "`⭐ ESSENTIEL`",
        "asin": "B0954FVW74",
        "prix": "9,90€",
        "lien": "https://www.amazon.fr/dp/B0954FVW74",
        "desc": "Pur savon de Marseille sans glycérine, parfait pour un nettoyage ultra-doux.",
        "pourquoi": "N'agresse pas les finitions fragiles comme le vernis au tampon. Produit naturel.",
        "conseil": "Dissoudre une poignée dans de l'eau tiède pour l'entretien régulier des bois huilés."
    },
    {
        "title": "Starwax Nettoyant Rénovateur Pinceaux & Outils (1L)",
        "marque": "Starwax",
        "cat": "Savons & Nettoyants",
        "gamme": "`💎 PREMIUM`",
        "asin": "B0CNQ4M7V9",
        "prix": "15,50€",
        "lien": "https://www.amazon.fr/dp/B0CNQ4M7V9",
        "desc": "Dissout les peintures et vernis même secs sur les fibres des pinceaux.",
        "pourquoi": "Redonne souplesse et longévité à vos brosses professionnelles. Évite le gaspillage.",
        "conseil": "Pour les pinceaux très secs, laissez tremper 24h puis rincez à l'eau savonneuse."
    },
    {
        "title": "Masques 3M Aura 9332+ FFP3 avec Soupape (Lot de 5)",
        "marque": "3M",
        "cat": "Accessoires Essentiels",
        "gamme": "`👑 EXPERT`",
        "asin": "B07GTFCS8R",
        "prix": "39,90€",
        "lien": "https://www.amazon.fr/dp/B07GTFCS8R",
        "desc": "Protection respiratoire maximale FFP3 pour travaux intensifs.",
        "pourquoi": "Crucial pour le ponçage des bois durs (chêne) et des anciennes peintures au plomb. Très confortable.",
        "conseil": "La soupape réduit la buée sur les lunettes de protection lors des longues séances."
    },
    {
        "title": "Gants Ansell AlphaTec 58-535 Haute Résistance Solvants",
        "marque": "Ansell",
        "cat": "Accessoires Essentiels",
        "gamme": "`👑 EXPERT`",
        "asin": "B004SQJHQK",
        "prix": "17,50€",
        "lien": "https://www.amazon.fr/dp/B004SQJHQK",
        "desc": "Gants techniques offrant une barrière totale contre les solvants agressifs.",
        "pourquoi": "Garde une excellente dextérité pour les travaux fins tout en protégeant la peau.",
        "conseil": "Indispensables lors du décirage ou de l'application de teintures solvantées."
    },
    {
        "title": "Tesa Precision Mask Sensitive - Ruban de Masquage Délicat (50m)",
        "marque": "Tesa",
        "cat": "Accessoires Essentiels",
        "gamme": "`💎 PREMIUM`",
        "asin": "B005DRE49S",
        "prix": "11,54€",
        "lien": "https://www.amazon.fr/dp/B005DRE49S",
        "desc": "Ruban conçu pour les surfaces extrêmement fragiles. Anti-arrachage.",
        "pourquoi": "Assure des bords de peinture parfaits sans abîmer le support au retrait.",
        "conseil": "Retirez le ruban dès que la finition est hors poussière pour une ligne nette."
    },
    {
        "title": "Libéron Coton à mécher professionnel (200g)",
        "marque": "Libéron",
        "cat": "Accessoires Essentiels",
        "gamme": "`👑 EXPERT`",
        "asin": "B00EV7MKHY",
        "prix": "10,50€",
        "lien": "https://www.amazon.fr/dp/B00EV7MKHY",
        "desc": "Mèche de coton pur non pelucheuse pour application de finitions.",
        "pourquoi": "Idéal pour les vernis au tampon, les popotes ou l'application des cires.",
        "conseil": "Constituez une 'poupée' en enveloppant la mèche dans un chiffon de lin propre."
    },
    {
        "title": "Libéron Pâte à bois grain fin (Teinte Chêne, 50ml)",
        "marque": "Libéron",
        "cat": "Décapage & Retouches",
        "gamme": "`💎 PREMIUM`",
        "asin": "B00KYR8AY2",
        "prix": "11,80€",
        "lien": "https://www.amazon.fr/dp/B00KYR8AY2",
        "desc": "Réparateur haute densité séchant sans retrait. Travail possible après séchage.",
        "pourquoi": "Se travaille comme le bois (ponçage, teinte, vernis). Fini très discret.",
        "conseil": "Prenez une teinte un peu plus claire si vous comptez teinter le meuble ensuite."
    },
    {
        "title": "Libéron Bâtons de Cire à reboucher (Teinte Chêne Moyen)",
        "marque": "Libéron",
        "cat": "Décapage & Retouches",
        "gamme": "`💎 PREMIUM`",
        "asin": "B000TVS8X6",
        "prix": "10,90€",
        "lien": "https://www.amazon.fr/dp/B000TVS8X6",
        "desc": "Mélange de cires et pigments pour combler fentes et trous de vers.",
        "pourquoi": "Permet de réparer un meuble terminé sans refaire la finition complète.",
        "conseil": "Malaxez un morceau entre vos doigts pour le ramollir avant application."
    },
    {
        "title": "Starwax Fabulous Acide Oxalique / Sel d'Oseille (400g)",
        "marque": "Starwax",
        "cat": "Décapage & Retouches",
        "gamme": "`👑 EXPERT`",
        "asin": "B082VV4T9Y",
        "prix": "8,50€",
        "lien": "https://www.amazon.fr/dp/B082VV4T9Y",
        "desc": "Poudre minérale pour éclaircir les bois noircis ou tachés.",
        "pourquoi": "Supprime les taches d'eau sur le chêne. Éclaircit le veinage taché.",
        "conseil": "Dissoudre à 10% dans l'eau tiède. Rincez toujours à l'alcool après séchage."
    },
    {
        "title": "Libéron Crayon de retouche bois à double pointe",
        "marque": "Libéron",
        "cat": "Décapage & Retouches",
        "gamme": "`💎 PREMIUM`",
        "asin": "B00EY7NPMK",
        "prix": "12,90€",
        "lien": "https://www.amazon.fr/dp/B00EY7NPMK",
        "desc": "Feutre spécialisé résistant à l'eau pour masquer les éraflures.",
        "pourquoi": "La double pointe permet de simuler le veinage pour une retouche invisible.",
        "conseil": "Travaillez par petits traits successifs dans le sens des fibres du bois."
    }
]

next_id = max(p['id'] for p in products) + 1
for d in new_data:
    products.append({
        'id': next_id,
        'icon': '✅',
        'title': d['title'],
        'attrs': {
            'Nom du produit': d['title'],
            'Marque': d['marque'],
            'Catégorie': d['cat'],
            'Gamme': d['gamme'],
            'Programme': 'Amazon',
            'Lien Affilié': d['lien'],
            'Prix Indicatif (€)': d['prix'],
            'URL Image Produit': '🔍 À rechercher',
            'Description Courte': d['desc'],
            'Pourquoi on le recommande': d['pourquoi'],
            'Conseil Pro': d['conseil']
        }
    })
    next_id += 1

cats_order = [
    ('🟤 1. HUILES & NOURRISSANTS', 'Huiles & Nourrissants'),
    ('🟡 2. CIRES, PEINTURES & EFFETS', 'Cires, Peintures & Effets'),
    ('🔵 3. SAVONS & NETTOYANTS', 'Savons & Nettoyants'),
    ('🟣 4. ACCESSOIRES ESSENTIELS', 'Accessoires Essentiels'),
    ('🟠 5. DÉCAPAGE & RETOUCHES', 'Décapage & Retouches'),
    ('🛠️ 6. OUTILS & MATÉRIEL PRO', 'Outils & Matériel Pro')
]

grouped = { c: [] for _, c in cats_order }
for p in products:
    cat = p['attrs'].get('Catégorie', 'Accessoires Essentiels')
    if cat in grouped: grouped[cat].append(p)

out = []
out.append("# 🛒 Liste Produits Atelier — Liens Directs Amazon.fr (Refined)")
out.append(f"*Referentiel complet et strict des {len(products)} produits configurés pour l'administration Tous à Table*\n")
out.append("---\n")

for h, cat in cats_order:
    out.append(f"## {h}\n")
    for prod in grouped[cat]:
        lines = []
        lines.append(f"### {prod['icon']} Produit {prod['id']} — {prod['title']}")
        # order keys
        keys = ['Nom du produit', 'Marque', 'Catégorie', 'Gamme', 'Programme', 'Lien Affilié', 'Prix Indicatif (€)', 'URL Image Produit', 'Description Courte', 'Pourquoi on le recommande', 'Conseil Pro']
        for k in keys:
            lines.append(f"- **{k}** : {prod['attrs'].get(k, '')}")
        lines.append("")
        out.append("\n".join(lines))
    out.append("---\n")

out.append("## 📋 Bilan pour Copier-Coller en Admin (JSON structure)\n")
out.append("```json")
stats = {cat: len(grouped[cat]) for _, cat in cats_order}
out.append(json.dumps({
  "inventory_status": "Ready for Admin Import",
  "total_products": len(products),
  "categories_breakdown": stats,
  "last_audit": "2026-03-29",
  "actions_needed": [
    "Vérifier manuellement les images manquantes et les prix cibles pour les anciens produits."
  ]
}, indent=2))
out.append("```\n\n---")
out.append("*Fin du référentiel — Maintenu par Antigravity*\n")

with open(filepath, "w", encoding="utf-8") as f:
    f.write("\n".join(out))

print(f"Updated with {len(new_data)} products!")
