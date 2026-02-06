from datetime import datetime
from mongoengine import Document, StringField, DateTimeField, ImageField, IntField, EmailField, SequenceField, \
    ReferenceField, NULLIFY


class SpecialiteModel(Document):
    id = SequenceField(primary_key=True)
    name = StringField(required=True, unique=True)
    description = StringField()
    icon = ImageField(required=False) # Optional: for UI display

    meta = {
        "collection": "Specialities"
    }

class DoctorModel(Document):
    id = SequenceField(primary_key=True)
    role = StringField(default="Doctor")
    username = StringField()
    email = EmailField()
    password = StringField()
    specialite = ReferenceField(SpecialiteModel, reverse_delete_rule=NULLIFY)
    image = ImageField(required=False)
    Telephone = StringField(required=False)
    address = StringField(required=False)
    city = StringField(required=False)
    state = StringField(required=False)
    created_at = DateTimeField(default=datetime.now())
    meta = {
        "collection": "Doctors"  # 👈 FIXED collection name
    }

class PatientModel(Document):
    id = SequenceField(primary_key=True)
    role = StringField(default="Patient")
    username = StringField()
    email = StringField()
    password=StringField()

    image = ImageField(required=False)
    Telephone = StringField(required=False)
    address = StringField(required=False)
    city = StringField(required=False)
    state = StringField(required=False)
    created_at = DateTimeField(default=datetime.now())
    meta = {
        "collection": "Patient"  # 👈 FIXED collection name
    }


class SecraitaryModel(Document):
    id = SequenceField(primary_key=True)
    role = StringField(default="Secretairy")
    username = StringField()
    email = StringField()
    password = StringField()
    image = ImageField(required=False)
    Telephone = StringField(required=False)
    address = StringField(required=False)
    city = StringField(required=False)
    state = StringField(required=False)
    created_at = DateTimeField(default=datetime.now())
    meta = {
        "collection": "Patient"  # 👈 FIXED collection name
    }


class AdminModel(Document):
    id = SequenceField(primary_key=True)
    role = StringField(default="Admin")
    Cin = StringField(required=True)
    username = StringField()
    password = StringField()
    created_at = DateTimeField('Created at',default=datetime.now())
    meta = {
        "collection": "Admin"  # 👈 FIXED collection name
    }

class AppointmentModel(Document):
        id = SequenceField(primary_key=True)

        doctor = ReferenceField(
            DoctorModel,
            required=True,
            reverse_delete_rule=NULLIFY
        )

        patient = ReferenceField(
            PatientModel,
            required=True,
            reverse_delete_rule=NULLIFY
        )

        specialite = ReferenceField(
            SpecialiteModel,
            required=False,
            reverse_delete_rule=NULLIFY
        )

        appointment_date = DateTimeField(required=True)

        status = StringField(
            default="Pending",
            choices=["Pending", "Confirmed", "Canceled", "Completed"]
        )

        reason = StringField(required=False)  # why the patient booked

        created_at = DateTimeField(default=datetime.now)

        meta = {
            "collection": "Appointments"
        }


from mongoengine import FloatField, BooleanField  # Importez ces champs supplémentaires


class FactureModel(Document):
    id = SequenceField(primary_key=True)

    # Référence au rendez-vous pour savoir ce qu'on facture
    appointment = ReferenceField(
        AppointmentModel,
        required=True,
        reverse_delete_rule=NULLIFY
    )

    # On duplique souvent les références Patient/Docteur pour un accès rapide sans jointure complexe
    patient = ReferenceField(PatientModel, required=True)
    doctor = ReferenceField(DoctorModel, required=True)

    # Détails financiers
    amount = FloatField(required=True, min_value=0)  # Montant HT ou TTC
    tax_rate = FloatField(default=0.0)  # Optionnel : TVA
    total_amount = FloatField(required=True)  # Montant total à payer

    # État de la facture
    status = StringField(
        default="Unpaid",
        choices=["Paid", "Unpaid", "Partially Paid", "Refunded"]
    )

    payment_method = StringField(
        choices=["Cash", "Card", "Insurance", "Bank Transfer"],
        required=False
    )

    # Dates
    issued_at = DateTimeField(default=datetime.now)
    paid_at = DateTimeField()  # Sera rempli quand le statut passera à "Paid"

    meta = {
        "collection": "Invoices",
        "ordering": ["-issued_at"]  # Les plus récentes en premier
    }