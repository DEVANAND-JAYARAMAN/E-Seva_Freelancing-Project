import { FormSchema } from "./types";
import { PATTERNS } from "./validators";

// 1. MSME Main Apply Form Schema
export const msmeApplySchema: FormSchema = {
  id: "msme-main",
  title: "MSME Registration",
  subtitle: "Apply for Udyam / MSME Certificate Online",
  paymentLabel: "Service Payment : ₹ 0",
  submitButtonText: "Apply",
  sections: [
    {
      title: "Basic Details",
      fields: [
        {
          name: "name",
          label: "Name",
          placeholder: "Owner full name",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Name is required",
          },
        },
        {
          name: "community",
          label: "Community",
          type: "select",
          colSpan: 1,
          options: [
            { label: "BC (Backward Classes)", value: "BC" },
            { label: "MBC (Most Backward Classes)", value: "MBC" },
            { label: "SC (Scheduled Castes)", value: "SC" },
            { label: "ST (Scheduled Tribes)", value: "ST" },
            { label: "OC / General", value: "OC" },
          ],
          validation: {
            required: true,
            requiredMessage: "Community is required",
          },
        },
        {
          name: "mobileNumber",
          label: "Mobile Number",
          placeholder: "Contact mobile number",
          type: "phone",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Mobile number is required",
            pattern: PATTERNS.PHONE,
            patternMessage: "Must be a valid 10-digit number",
          },
        },
        {
          name: "aadhaarCard",
          label: "Aadhaar Card (PDF/JPG)",
          type: "file",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Aadhaar Card upload is required",
          },
        },
        {
          name: "companyName",
          label: "Company Name",
          placeholder: "Registered enterprise name",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Company Name is required",
          },
        },
        {
          name: "panCard",
          label: "Pan Card (PDF/JPG)",
          type: "file",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "PAN Card upload is required",
          },
        },
        {
          name: "buildingName",
          label: "Building Name",
          placeholder: "Building door / block name",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Building Name is required",
          },
        },
        {
          name: "district",
          label: "District",
          type: "select",
          colSpan: 1,
          options: [
            { label: "Chennai", value: "Chennai" },
            { label: "Coimbatore", value: "Coimbatore" },
            { label: "Madurai", value: "Madurai" },
            { label: "Trichy", value: "Trichy" },
            { label: "Salem", value: "Salem" },
          ],
          validation: {
            required: true,
            requiredMessage: "District is required",
          },
        },
        {
          name: "wardNo",
          label: "Ward No/Street Name",
          placeholder: "Street name or ward number",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Ward/Street Name is required",
          },
        },
        {
          name: "taluk",
          label: "Taluk",
          placeholder: "State taluk",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Taluk is required",
          },
        },
        {
          name: "pinCode",
          label: "Pin Code",
          placeholder: "6-digit PIN code",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Pin Code is required",
            pattern: PATTERNS.PINCODE,
            patternMessage: "Must be a valid 6-digit postal code",
          },
        },
        {
          name: "vao",
          label: "VAO",
          placeholder: "Local VAO name",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "VAO name is required",
          },
        },
      ],
    },
    {
      title: "Account Details",
      fields: [
        {
          name: "accountNumber",
          label: "Account Number",
          placeholder: "Bank account number",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Account number is required",
            pattern: PATTERNS.NUMERIC,
            patternMessage: "Must be numeric characters only",
          },
        },
        {
          name: "confirmAccountNumber",
          label: "Confirm Account Number",
          placeholder: "Re-enter bank account number",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Please confirm your account number",
            custom: (value, allValues) => {
              if (value !== allValues.accountNumber) {
                return "Account numbers do not match";
              }
              return null;
            },
          },
        },
        {
          name: "ifscCode",
          label: "IFSC Code",
          placeholder: "Bank branch IFSC code",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "IFSC code is required",
          },
        },
        {
          name: "micrNumber",
          label: "Micr Number",
          placeholder: "9-digit MICR code",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "MICR number is required",
          },
        },
      ],
    },
    {
      title: "Number Of Employees",
      fields: [
        {
          name: "maleCount",
          label: "Male Count",
          placeholder: "Male headcount",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Male headcount is required",
            pattern: PATTERNS.NUMERIC,
            patternMessage: "Must be a valid integer",
          },
        },
        {
          name: "femaleCount",
          label: "Female Count",
          placeholder: "Female headcount",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Female headcount is required",
            pattern: PATTERNS.NUMERIC,
            patternMessage: "Must be a valid integer",
          },
        },
      ],
    },
    {
      title: "Investment Of The Company",
      fields: [
        {
          name: "amountInLakhs",
          label: "Amount In Lakhs",
          placeholder: "Total investment in Lakhs",
          type: "text",
          colSpan: 1,
          validation: {
            required: true,
            requiredMessage: "Investment amount in Lakhs is required",
            pattern: PATTERNS.NUMERIC,
            patternMessage: "Must be numeric digits",
          },
        },
      ],
    },
    {
      title: "Additional Details",
      fields: [
        {
          name: "gst",
          label: "GST",
          type: "select",
          colSpan: 1,
          options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ],
          validation: {
            required: true,
            requiredMessage: "GST registration status is required",
          },
        },
        {
          name: "typeOfOrganization",
          label: "Type Of Organization",
          type: "select",
          colSpan: 1,
          options: [
            { label: "Proprietorship", value: "Proprietorship" },
            { label: "Partnership", value: "Partnership" },
            { label: "Private Limited", value: "Private Limited" },
            { label: "Public Limited", value: "Public Limited" },
            { label: "Others", value: "Others" },
          ],
          validation: {
            required: true,
            requiredMessage: "Organization type is required",
          },
        },
        {
          name: "itr",
          label: "ITR",
          type: "select",
          colSpan: 1,
          options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ],
          validation: {
            required: true,
            requiredMessage: "ITR status is required",
          },
        },
        {
          name: "categoryOfWork",
          label: "Category Of Work",
          type: "select",
          colSpan: 1,
          options: [
            { label: "Manufacturing", value: "Manufacturing" },
            { label: "Services", value: "Services" },
            { label: "Trading", value: "Trading" },
          ],
          validation: {
            required: true,
            requiredMessage: "Category of work is required",
          },
        },
      ],
    },
  ],
};

// 2. PAN Search Form Schema
export const msmePanSchema: FormSchema = {
  id: "msme-pan",
  title: "Pan To Msme Udyam Find",
  subtitle: "Find your MSME Udyam credentials using PAN and Owner details",
  submitButtonText: "Submit Search",
  sections: [
    {
      title: "PAN Details",
      fields: [
        {
          name: "panNo",
          label: "Pan No",
          placeholder: "Enter PAN Number (e.g. ABCDE1234F)",
          type: "text",
          colSpan: 2,
          validation: {
            required: true,
            requiredMessage: "PAN Number is required",
            pattern: PATTERNS.PAN,
            patternMessage: "Must be a valid 10-character PAN",
          },
        },
        {
          name: "ownerName",
          label: "Owner Name",
          placeholder: "Enter proprietor or owner name",
          type: "text",
          colSpan: 2,
          validation: {
            required: true,
            requiredMessage: "Owner Name is required",
          },
        },
        {
          name: "customerMobile",
          label: "Customer Mobile",
          placeholder: "Enter 10-digit mobile number",
          type: "phone",
          colSpan: 2,
          validation: {
            required: true,
            requiredMessage: "Mobile number is required",
            pattern: PATTERNS.PHONE,
            patternMessage: "Must be a valid 10-digit number",
          },
        },
      ],
    },
  ],
};

// 3. Mobile Search Form Schema
export const msmeMobileSchema: FormSchema = {
  id: "msme-mobile",
  title: "Mobile To Msme Udyam Find",
  subtitle: "Locate Udyam registration records connected with mobile number",
  submitButtonText: "Submit Search",
  sections: [
    {
      title: "Mobile Verification Details",
      fields: [
        {
          name: "mobileNo",
          label: "Mobile No",
          placeholder: "Enter registered mobile number",
          type: "phone",
          colSpan: 2,
          validation: {
            required: true,
            requiredMessage: "Mobile Number is required",
            pattern: PATTERNS.PHONE,
            patternMessage: "Must be a valid 10-digit number",
          },
        },
        {
          name: "ownerName",
          label: "Owner Name",
          placeholder: "Enter owner full name",
          type: "text",
          colSpan: 2,
          validation: {
            required: true,
            requiredMessage: "Owner Name is required",
          },
        },
        {
          name: "customerEmail",
          label: "Customer Email",
          placeholder: "Enter contact email address",
          type: "email",
          colSpan: 2,
          validation: {
            required: true,
            requiredMessage: "Customer Email is required",
            pattern: PATTERNS.EMAIL,
            patternMessage: "Must be a valid email format",
          },
        },
      ],
    },
  ],
};
