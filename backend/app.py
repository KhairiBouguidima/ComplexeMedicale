from flask_cors import CORS
from flask import Flask, request, json
from flask import jsonify
from flask_jwt_extended import (JWTManager ,create_access_token,get_jwt_identity,jwt_required)
from flask_pymongo import PyMongo
from model import DoctorModel, PatientModel, SpecialiteModel, AppointmentModel, AdminModel, FactureModel
from bcrypt import hashpw, checkpw, gensalt
import base64

def hashpassword(password):
    return hashpw(password.encode('utf-8'),gensalt()).decode('utf-8')
def checkpassword(password,oldpasword):
    return checkpw(password.encode("utf-8"),oldpasword.encode("utf-8"))

app = Flask(__name__)
#mongo
app.config["MONGO_URI"]='mongodb://localhost:27017/medical'
app.config["SECRET_KEY"]='25192643'
mongo = PyMongo(app)
#jwt
app.config['JWT_SECRET_KEY']="25192643"
app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'
jwt = JWTManager(app)
CORS(app)
from mongoengine import connect, ValidationError

connect(
    db="medical_db",
    host="mongodb://127.0.0.1:27017/medical_db"
)

@app.route("/",methods=["GET","POST"])
@app.route("/Home" , methods=["GET","POST"])
def home():
    if request.method == "GET":
        data = request.get_json()
        return jsonify({"message":"Hello World"})

@app.route('/register',methods=["GET","POST"])
def register ():
        if request.method == "POST":
            data = request.get_json()
            if not data :
                return jsonify({"message": "Data is not resived"}),405
            if data.get("role") == "Doctor" :
                if DoctorModel.objects(email=data.get("email")).first():
                    return jsonify({"message": "User already exists"}), 405
                user = DoctorModel (
                    username = data["username"],
                    email = data["email"],
                    password = hashpassword(data["password"]),
                 )
                user.save()

            if data.get("role") == "Patient" :
                if PatientModel.objects(email=data.get("email")).first():
                    return jsonify({"message": "User already exists"}), 405
                user = PatientModel (
                    username = data["username"],
                    email = data["email"],
                    password = hashpassword(data["password"]),
                 )
                user.save()

        return jsonify({"message": "Account Created  succeffuly"}),200

@app.route('/login',methods=["GET","POST"])
def login ():
    if request.method == "POST":
        data = request.get_json()
        if not data :
            return jsonify({"message": "Data is not resived"}),405
        if data["role"] == "Doctor" :
            checkuser = DoctorModel.objects(role= data.get("role"),email =data.get("email")).first()
            if not checkuser :
                return  jsonify({"message": "User  not Found"}),404
            if not  checkpassword(data.get("password"),checkuser.password):
                return jsonify({"message": "password is not match"}) ,405
            token = create_access_token(identity=str(checkuser.id))
            return jsonify({"message":"Hello in your account",
                    "token":token}),200
        if data["role"] == "Patient" :
            checkuser = PatientModel.objects(role= data.get("role"),email =data.get("email")).first()
            if not checkuser :
                return  jsonify({"message": "User  not Found"}),404
            if not  checkpassword(data.get("password"),checkuser.password):
                return jsonify({"message": "password is not match"}) ,405
            token = create_access_token(identity=str(checkuser.id))
            print(token)
            return jsonify({"message":"Login Successfuly",
                            "token":token }),200
#Admiin
from werkzeug.security import generate_password_hash


@app.route("/Admin/Register", methods=["POST"])
def admin_register():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Données manquantes"}), 400

    # Vérifier si l'admin existe déjà via le pseudo ou CIN
    existing_user = AdminModel.objects(username=data.get("username")).first()
    if existing_user:
        return jsonify({"message": "Cet utilisateur existe déjà"}), 409

    # Création du nouvel admin
    new_admin = AdminModel(
        username=data.get("username"),
        password=hashpassword(data.get("password")),  # Toujours hasher !
        Cin=data.get("cin"),
        role="Admin"
    )
    new_admin.save()

    return jsonify({"message": "Administrateur créé avec succès !"}), 201

@app.route("/Admin/Login", methods=["POST"])
def admin_login():
    data = request.get_json()


    print (    data.get("username"), data.get("password"))
    # On cherche par username car 'email' n'existe pas dans votre AdminModel
    checkuser = AdminModel.objects(username=data.get("username")).first()
    if not checkuser:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    # Utilisez check_password_hash car vous avez utilisé generate_password_hash à l'inscription
    if not checkpassword(data.get("password"),checkuser.password):
        return jsonify({"message": "Mot de passe incorrect"}), 405

    token = create_access_token(identity=str(checkuser.id))
    return jsonify({"message": "Bienvenue", "token": token})
@app.route("/Admin/Logout",methods=["GET","POST"])
def admin_logout():
    token = request.headers.get("Authorization").replace("Bearer ","")

@app.route('/Admin/List/Patient', methods=['GET'])
def admin_patient_list():
    listPatient = json.loads(PatientModel.objects().to_json())
    return jsonify({"Patientlist":listPatient})

@app.route('/Admin/List/Doctor', methods=['GET'])
def admin_doctor_list():
    listDoctor = json.loads(DoctorModel.objects().to_json())
    print(listDoctor)
    return jsonify({"Doctorlist":listDoctor})


@app.route('/Admin/Add/Speciality', methods=['POST'])
def add_speciality():
    try:
        # Si vous envoyez du JSON simple (sans l'image pour l'instant)
        data = request.get_json()

        if not data or not data.get("name"):
            return jsonify({"message": "Le nom est requis"}), 400

        # Vérification si elle existe déjà
        if SpecialiteModel.objects(name=data.get("name")).first():
            return jsonify({"message": "Cette spécialité existe déjà"}), 409

        new_spec = SpecialiteModel(
            name=data.get("name"),
            description=data.get("description")
        )
        new_spec.save()

        return jsonify({"message": "Spécialité ajoutée avec succès"}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# Suppression d'un Docteur
@app.route('/Admin/Delete/Doctor/<id>', methods=['DELETE'])
def delete_doctor(id):
    doctor = DoctorModel.objects(id=id).first()
    if not doctor:
        return jsonify({"message": "Docteur non trouvé"}), 404
    doctor.delete()
    return jsonify({"message": "Docteur supprimé avec succès"}), 200

# Suppression d'un Patient
@app.route('/Admin/Delete/Patient/<id>', methods=['DELETE'])
def delete_patient(id):
    patient = PatientModel.objects(id=id).first()
    if not patient:
        return jsonify({"message": "Patient non trouvé"}), 404
    patient.delete()
    return jsonify({"message": "Patient supprimé avec succès"}), 200

# Suppression d'une Spécialité
@app.route('/Admin/Delete/Speciality/<int:id>', methods=['DELETE'])
def delete_speciality(id):
    spec = SpecialiteModel.objects(id=id).first()
    if not spec:
        return jsonify({"message": "Spécialité non trouvée"}), 404
    spec.delete()
    return jsonify({"message": "Spécialité supprimée avec succès"}), 200
@app.route('/Admin/List/Speciality', methods=['GET'])
def admin_speciality_list():
    # .to_json() est essentiel pour MongoEngine
    listSpec = json.loads(SpecialiteModel.objects().to_json())
    return jsonify({"Specialitylist": listSpec})


@app.route('/Admin/Update/Speciality/<id>', methods=['PUT'])
def update_speciality(id):
    try:
        data = request.json
        spec = SpecialiteModel.objects(id=id).first()
        if not spec:
            return jsonify({"message": "Spécialité non trouvée"}), 404

        spec.update(name=data.get('name'), description=data.get('description'))
        return jsonify({"message": "Spécialité mise à jour avec succès"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
# Route pour lister tous les rendez-vous
@app.route('/Admin/List/Appointment', methods=['GET'])
def admin_appointment_list():
    try:
        # On récupère les rendez-vous
        # Note: Si tu utilises des ReferenceField, utilise .select_related() pour avoir les détails
        listApp = json.loads(AppointmentModel.objects().to_json())
        return jsonify({"Appointmentlist": listApp}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# Route pour supprimer un rendez-vous
@app.route('/Admin/Delete/Appointment/<id>', methods=['DELETE'])
def delete_appointment(id):
    appo = AppointmentModel.objects(id=id).first()
    if not appo:
        return jsonify({"message": "Rendez-vous non trouvé"}), 404
    appo.delete()
    return jsonify({"message": "Rendez-vous annulé avec succès"}), 200


@app.route('/Admin/List/Facture', methods=['GET'])
def admin_facture_list():
    try:
        # On récupère les factures en joignant les infos des références
        invoices = FactureModel.objects().select_related()

        # Transformation en JSON propre pour React
        list_factures = []
        for f in invoices:
            list_factures.append({
                "id": f.id,
                "patient_name": f.patient.username if f.patient else "Inconnu",
                "doctor_name": f.doctor.username if f.doctor else "Inconnu",
                "amount": f.total_amount,
                "status": f.status,
                "date": f.issued_at.strftime("%d/%m/%Y %H:%M"),
                "method": f.payment_method or "N/A"
            })

        return jsonify({"Facturelist": list_factures}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
#Patient

@app.route('/Patient/Profile', methods=["GET", "POST"])
@jwt_required()
def profilePatient():
    user_id = get_jwt_identity()
    current_user = DoctorModel.objects(id=user_id).first()
    # Verify user exists in DB even if token is valid
    if not current_user:
        return jsonify({"message": "User record not found"}), 404

    if request.method == "GET":
        return jsonify({
            "message": "User profile fetched",
            "role":current_user.role ,
            "username": current_user.username,
            "email": current_user.email
        }), 200

    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400

        # Example: Updating the user's name
        current_user.update(lastname=data.get('lastname', current_user.lastname))
        current_user.reload()  # Refresh local object from DB

        return jsonify({
            "message": "Profile updated successfully",
            "lastname": current_user.lastname
        }), 200

@app.route('/api/patient/update/<int:patient_id>', methods=['PUT'])
def update_patient_profile(patient_id):
    # Fetch the patient by ID
    patient = PatientModel.objects(id=patient_id).first()

    if not patient:
        return jsonify({"message": "Patient not found"}), 404

    data = request.get_json()

    # List of fields allowed to be updated via this route
    allowed_fields = ['username', 'email', 'Telephone', 'address', 'city', 'state']

    for field in allowed_fields:
        if field in data:
            setattr(patient, field, data[field])

    try:
        patient.save()
        return jsonify({
            "message": "Profile updated successfully",
            "patient": {
                "username": patient.username,
                "email": patient.email
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


#Doctor

@app.route('/api/doctor/<int:doctorId>', methods=['GET'])
def get_doctor(doctorId):
    doctor = DoctorModel.objects.get(id=doctorId)

    # Conversion de l'image en base64 pour le frontend
    img_base64 = ""
    if doctor.image:
        img_base64 = base64.b64encode(doctor.image.read()).decode('utf-8')

    return jsonify({
        "username": doctor.username,
        "Telephone": doctor.Telephone,
        "city": doctor.city,
        "address": doctor.address,
        "state": doctor.state,
        "specialite": str(doctor.specialite.id) if doctor.specialite else "",
        "image": img_base64
    })



#admin
if __name__ == '__main__':
    app.run(debug=True)