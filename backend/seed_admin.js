const { User } = require("./src/models");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    const email = "admin@hyundai.tn";
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name: "Super Administrateur",
        email: email,
        password: hashedPassword,
        role: "ADMIN",
        isVerified: true
      }
    });

    if (created) {
      console.log("Compte Admin créé avec succès !");
    } else {
      await user.update({ role: "ADMIN", isVerified: true, password: hashedPassword });
      console.log("Compte Admin mis à jour !");
    }
    process.exit(0);
  } catch (err) {
    console.error("Erreur Seeding Admin:", err);
    process.exit(1);
  }
}

seedAdmin();
