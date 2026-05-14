using System.Data;
using Dapper;

namespace StaffManagement.Api.Data;

/// <summary>
/// Dapper 2.1.x has no built-in mapping between SQL Server's <c>date</c>
/// type and <see cref="DateOnly"/>. Registering this handler at startup
/// lets repositories pass and receive DateOnly values directly.
/// </summary>
public sealed class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
	public override void SetValue(IDbDataParameter parameter, DateOnly value)
	{
		parameter.DbType = DbType.Date;
		parameter.Value = value.ToDateTime(TimeOnly.MinValue);
	}

	public override DateOnly Parse(object value) => value switch
	{
		DateTime dt    => DateOnly.FromDateTime(dt),
		DateOnly d     => d,
		string s       => DateOnly.Parse(s),
		_ => throw new InvalidCastException($"Cannot convert {value?.GetType().Name ?? "null"} to DateOnly.")
	};
}

public sealed class NullableDateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly?>
{
	public override void SetValue(IDbDataParameter parameter, DateOnly? value)
	{
		parameter.DbType = DbType.Date;
		parameter.Value = value.HasValue
			? value.Value.ToDateTime(TimeOnly.MinValue)
			: (object)DBNull.Value;
	}

	public override DateOnly? Parse(object value)
	{
		if (value is null || value is DBNull)
		{
			return null;
		}

		return value switch
		{
			DateTime dt => DateOnly.FromDateTime(dt),
			DateOnly d  => d,
			string s    => DateOnly.Parse(s),
			_ => throw new InvalidCastException($"Cannot convert {value.GetType().Name} to DateOnly.")
		};
	}
}
