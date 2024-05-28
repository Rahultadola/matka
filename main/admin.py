from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError

from .models import MatkaUser, MatkaAdmin,  RKDBet as Bid, Wallet, Transaction, StarLine


class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput)

    class Meta:
        model = MatkaUser
        fields = ["mobile", "username"]

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        user.unhashed_pass = self.cleaned_data["password2"]
        user.set_password(self.cleaned_data["password2"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    disabled password hash display field.
    """

    password = ReadOnlyPasswordHashField()

    class Meta:
        model = MatkaUser
        fields = ["mobile", "password", "username", "is_active", "is_admin"]


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ["mobile", "username", "is_admin"]
    list_filter = ["is_admin"]
    fieldsets = [
        (None, {"fields": ["mobile", "password"]}),
        ("Personal info", {"fields": ["username"]}),
        ("Permissions", {"fields": ["is_admin"]}),
    ]
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = [
        (
            None,
            {
                "classes": ["wide"],
                "fields": ["mobile", "username", "password1", "password2"],
            },
        ),
    ]
    search_fields = ["mobile"]
    ordering = ["mobile"]
    filter_horizontal = []


# Now register the new UserAdmin...
admin.site.register(MatkaUser, UserAdmin)
admin.site.register(MatkaAdmin)
admin.site.register(Bid)
admin.site.register(Wallet)
admin.site.register(Transaction)
admin.site.register(StarLine)
# ... and, since we're not using Django's built-in permissions,
# unregister the Group model from admin.
admin.site.unregister(Group)